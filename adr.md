# Architecture Decision Record (ADR)

Journal des décisions d'architecture prises pendant le hackathon (dépendance nouvelle, stockage, pattern structurant).

Une entrée par décision, ajoutée à la fin, au format :

```
### AAAA-MM-JJ — <titre court>

- **Décision** : ce qui a été choisi
- **Contexte** : le problème à résoudre
- **Alternatives envisagées** : les autres options, et pourquoi elles sont écartées
- **Conséquences** : les compromis acceptés
```

Le fichier est un journal : on ajoute, on ne réécrit pas. Pour revenir sur une décision, une nouvelle entrée le dit explicitement.

---

## Décisions

### 2026-11-18 — Financements saisis en mémoire (pas de persistance durable)

- **Décision** : les financements ajoutés à un poste (Itération 3) sont stockés en mémoire dans le process `api`, à côté de `POSITIONS` — pas de base de données.
- **Contexte** : il faut saisir un premier financement pour amorcer le calcul réel de couverture (Itération suivante), avec ~50 minutes de build restantes et un budget de 10 minutes de codage par itération.
- **Alternatives envisagées** : persistance dans Postgres (`team12`, déjà provisionnée) — écartée pour cette fenêtre : ajoute client DB, schéma et variables d'environnement, dépasserait le budget cumulé avec la fonctionnalité elle-même.
- **Conséquences** : chaque redéploiement d'itération (`podman compose ... --force-recreate`) relance le conteneur `api` et perd les financements saisis pendant le tour de test précédent. Fragilité à documenter dans `DEPLOIEMENT.md` ; la démo d'un calcul réel (itération suivante) devra re-saisir un financement après déploiement, ou l'itération concernée devra semer une donnée de départ. Décision validée par le développeur.

### 2026-11-18 — Statut de financement : filtré pour la couverture, pas pour le doublon

- **Décision** : `Funding` porte un champ optionnel `status?: "acquis" | "sollicite" | "a_solliciter"` (absence = `"acquis"`, pour ne pas casser les données existantes). `computeCoverage` et `computeCliff` ne comptent que les financements `isActive && isSecured` (acquis). `hasOverlap`/`computeOverlapMonths` restent inchangés et comptent tous les statuts.
- **Contexte** : `passation/documents-association/donnees-hackathon-budgets.pdf` impose « ne présente pas un chiffre comme un engagement de La Cloche envers un financeur » — incompatible avec un modèle où tout financement saisi, même une simple demande, compte comme s'il était sécurisé. Le même document documente un vrai cas de double financement (poste « Chargé·e du programme ») où le risque vient précisément d'une demande *non encore acquise* (Lululemon, à solliciter) qui chevaucherait un financement déjà acquis sur le même reste à financer.
- **Alternatives envisagées** : (1) statut en lecture seule sans toucher au calcul — écartée, ne respecte pas la règle d'usage du PDF dès que les vraies données remplaceront les fictives ; (2) filtrer aussi `hasOverlap` par statut acquis — écartée, viderait l'alerte doublon de son utilité : elle doit prévenir *avant* qu'une demande redondante ne parte, pas seulement constater un doublon déjà signé.
- **Conséquences** : un financement "sollicité" ou "à solliciter" n'apparaît plus dans la couverture ni la date de falaise tant qu'il n'est pas confirmé "acquis" (pas d'édition de statut après coup pour cette itération — à ajouter si besoin). Décision prise sans confirmation du développeur sur le temps restant (deux "go" d'affilée) : périmètre volontairement réduit à l'infrastructure du statut, sans remplacement des données fictives — voir `ITERATIONS.md`, Itération 10.

### 2026-11-18 — Seuil de falaise orange : 6 mois (prototype), pas 3 mois (texte du cadrage)

- **Décision** : le seuil de l'alerte orange reste à 6 mois (`determineAlert`, `monthsBeforeCliff < 6`), inchangé.
- **Contexte** : `cadrage/3-solution.md` dit deux fois « fin dans moins de 3 mois » (lignes 7 et 70). Mais le prototype interactif PM Lab (`passation/croquis/ecran-02-...png`, pixel-exact, référence des Itérations 8-9) affiche littéralement le libellé « Falaise < 6 mois » sur plusieurs postes (P01, P03, P04, P06, P07), dont certains à 5 mois de la falaise — ce qui ne serait pas orange avec un seuil à 3 mois. Les deux sources viennent du même dossier de cadrage et se contredisent.
- **Alternatives envisagées** : (1) passer à 3 mois pour suivre le texte narratif — écarté, ça désaligne l'app du prototype visuellement validé par l'équipe ; (2) ne pas trancher et bloquer sur une clarification des cadreurs — écarté par le développeur, qui a préféré trancher immédiatement plutôt que d'attendre une réponse de l'équipe.
- **Conséquences** : le code et le prototype restent cohérents entre eux. Le texte de `cadrage/3-solution.md` reste en contradiction avec l'app — à signaler si l'équipe le relit. Décision prise par le développeur (oui, garder 6 mois), pas par Claude.
