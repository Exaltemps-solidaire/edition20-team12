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
