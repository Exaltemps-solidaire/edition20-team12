# Plan d'itérations — La Cloche (équipe J7BT47)

- **Source du plan** : proposé par l'agent (aucun plan d'itérations trouvé dans la passation : `cadrage/6-plan-de-livraison.md` est « Pas encore produit », pas de clé `iterations` dans `passation.json`).
- **Plan validé le 2026-11-18**, tel quel (y compris le choix par défaut I1/I2 ci-dessous).
- **Temps restant annoncé** : ~30 minutes (au lancement de `/planifier-iterations`, le 2026-11-18) ; ~25-30 minutes confirmées au lancement de `/iteration 1`.
- **Durée du tour de test de l'équipe** : 5 minutes.
- **Hors périmètre de cette fenêtre de build** : upload Excel, calcul réel de couverture/date de falaise, écran « Détail d'un poste », accès différencié par rôle, saisie des conventions/postes, vue stratégique direction (projections 12/24/36 mois), onglets « Justificatif financier » et « Contrôles » — voir « À venir ».

⚠️ **Capacité** : avec ~30 min restantes et un tour de test de 5 min, une itération coûte déjà environ 10 min (codage) + 5 min (publication) + 5 min (tour de test) = 20 min. Il ne reste pas assez de marge pour détailler une deuxième itération complète dans cette fenêtre : une seule itération est détaillée ci-dessous. Le temps sera redemandé au début de l'itération 1 et pourra changer ce calcul.

⚠️ **Résolution par défaut d'un point flou signalé lors de `/recuperer-passation`** : `3-solution.md` décrit deux jeux d'écrans non explicitement fusionnés (Sidick : vue d'ensemble / tableau des postes / détail d'un poste ; Maestro : tableau de bord direction avec projections). Le même document note cependant : *« I1 apporte la mécanique de saisie pas à pas, les alertes colorées et la règle d'accès différencié ; I2 apporte les projections dans le temps et la vue stratégique »*. Je retiens par défaut **un seul outil**, livré en deux phases (I1 = écrans Sidick, I2 = écrans Maestro), dans cet ordre. **À confirmer par les cadreurs avant `/iteration 1`.**

---

## Itération 1 : afficher la liste des postes avec leur alerte de couverture

- **Dans le périmètre** :
  - Route API `GET /api/v1/postes` qui renvoie un jeu de postes en dur (id, poste, antenne, taux de couverture, alerte).
  - Une fonction pure `calculerAlerte(couverture, moisAvantFalaise)` → `rouge` / `orange` / `violet` / `vert`, utilisée par la route.
  - Page d'accueil du front (remplace la page par défaut de `create-next-app`) : tableau des postes inspiré de l'Écran 2 (pastille d'alerte, poste, antenne, % de couverture), données lues via `fetch("/api/v1/postes")`.
  - `.env.example` (racine) et `DEPLOIEMENT.md` (racine), seules pièces manquantes du contrat de déployabilité — le squelette `api/`/`frontend/` (Dockerfile, `/health`, `/sante`) est déjà en place.
- **Hors périmètre** : upload Excel, calcul réel à partir de conventions/postes saisis, écran détail d'un poste, vue par rôle, onglets Justificatif/Contrôles, vue direction/projections.
- **Critères d'acceptation** :
  - Étant donné l'API démarrée, quand on appelle `GET /api/v1/postes`, alors elle répond 200 avec un tableau JSON d'au moins 3 postes, chacun avec un champ d'alerte.
  - Étant donné le front chargé sur `/`, quand la page s'affiche, alors le tableau liste les postes avec leur pastille d'alerte et leur % de couverture (données en dur).
  - Étant donné l'application déployée selon le contrat, quand on vérifie `/health` et `/sante` sur le port 8080, alors elles répondent 200.
- **Hypothèse de l'équipe couverte** : amorce des hypothèses 1 et 2 de `1-problematique.md` (identifier un poste à risque, alertes colorées sans analyse manuelle) — l'affichage existe, la mesure réelle (temps < 2 min, 0 croisement manuel) suppose les vraies données, reportée aux itérations suivantes.
- **Codage estimé** : 8 minutes (squelette déjà posé ; reste le routage, les données en dur et l'affichage).
- **Fichiers prévus** : `api/src/routes.ts`, `frontend/src/app/page.tsx` (+ éventuellement `page.module.css`), `.env.example`, `DEPLOIEMENT.md`.
- **Tests unitaires prévus** : 1 à 3, sur `calculerAlerte` (ex. non couvert → rouge, falaise proche → orange, chevauchement → violet).
- **Étapes ajoutées à la démo** : ouvrir l'URL publique, vérifier que le tableau des postes affiche au moins une alerte rouge et une alerte verte.
- **Bilan** :
  - **Durée de codage réelle** : ~3,5 minutes (début/fin dans `.iterations/1.debut` et `.iterations/1.fin`), sans dépassement — très en dessous du budget de 8-10 minutes.
  - **Écart au plan** : consigne du développeur en cours de codage (« code en anglais ») — le code neuf de cette itération (types, fonctions, route) est en anglais ; les identifiants du squelette préexistant (`router`, `Reponse`, `chemin`...) n'ont pas été renommés, hors périmètre de l'itération. Conséquence sur le plan : la route est `GET /api/v1/positions` (pas `/postes`), et la fonction `determineAlert` (pas `calculerAlerte`). Les libellés affichés à l'écran restent en français.
  - **Fait** :
    - Critère 1 : `GET /api/v1/positions` répond 200 avec 8 postes (P01-P08), chacun avec une alerte calculée.
    - Critère 2 : le tableau du front affiche pastille d'alerte, poste, antenne, couverture et date de falaise, données en dur.
    - Critère 3 : `/health` et `/sante` répondent 200 sur le port 8080 (vérifié localement ; vérification navigateur demandée au développeur, non bloquante).
  - **Reporté** : la 4ᵉ couleur d'alerte (violet, chevauchement/double financement) prévue dans l'énoncé initial n'a pas été codée — seules rouge/orange/vert le sont, l'alerte « violet » suppose la détection de doublons entre conventions, qui dépend de la saisie réelle (déjà prévue en « À venir » point 3, où elle est précisée).
  - **Bloqué par le harnais** : rien — contrat de déployabilité sans borne, `npm test` vert, signal PM Lab accepté du premier coup.
  - **Difficulté de déploiement (hors codage, pendant la publication)** : l'image `docker.io/library/nginx:1.27-alpine` était inatteignable (rate-limit anonyme Docker Hub, quota partagé par la plateforme). Contournement : `frontend/Dockerfile` installe nginx via `apk` sur l'image `node:24-alpine` déjà en cache, au lieu de tirer l'image nginx dédiée — pas d'impact sur le contrat ni sur le port exposé.
  - **Modifications** :
    - `api/src/routes.ts` : types `Position`/`Alert`, `determineAlert`, données `POSITIONS` (P01-P08), route `GET /api/v1/positions` — sert les critères 1 et 2.
    - `api/src/routes.test.ts` : 4 tests ajoutés (route + 3 cas d'alerte) — critère 2 (DoD point 2).
    - `frontend/src/app/page.tsx`, `page.module.css` : tableau des postes, appel `fetch("/api/v1/positions")` — critère 2.
    - `frontend/src/app/layout.tsx` : titre/description de la page.
    - `.env.example`, `DEPLOIEMENT.md` : pièces manquantes du contrat de déployabilité — critère 3.
    - `api/Dockerfile`, `frontend/Dockerfile` : qualification `docker.io/library/...` des images de base ; contournement du rate-limit nginx ci-dessus.
    - `podman-compose.yml` : recette de déploiement minimale (réseau `core-network`, ports 8080/8081).
    - `e2e/demo.spec.ts` : étape de démo ajoutée (tableau visible, « Non couvert » affiché).

---

## Itération 2 : écran « Détail d'un poste »

- **Dans le périmètre** : depuis le tableau, cliquer une ligne ouvre une page `/postes/[id]` avec le détail du poste (financements listés, cas P05 Lyon mis en avant) ; données en dur, réutilisant `POSITIONS`.
- **Hors périmètre** : saisie, calcul réel, édition.
- **Critères d'acceptation** :
  - Étant donné le tableau affiché, quand on clique une ligne, alors on arrive sur une page détail de ce poste.
  - Étant donné la page détail de P05, quand elle s'affiche, alors elle montre la vacance/le financement orphelin.
- **Codage estimé** : 8 minutes.
- **Fichiers prévus** : `frontend/src/app/postes/[id]/page.tsx`, `api/src/routes.ts` (route `GET /api/v1/positions/:id`).
- **Tests unitaires prévus** : 1-2, sur la route de détail (404 si id inconnu).
- **Bilan** : _à remplir en fin d'itération._

---

## À venir (ordre de priorité, à détailler au fil de l'eau)

1. Saisie des conventions (onglet « Financements ») et des postes (onglet « Postes »), remplaçant les données en dur.
2. Calcul réel du taux de couverture et de la date de falaise à partir des données saisies ; détection des trous et doublons (alerte violet/chevauchement, reportée de l'itération 1).
3. Accès différencié par rôle : vue lecture seule pour la responsable d'antenne, sans salaire affiché.
4. Vue stratégique direction : projections à 12, 24 et 36 mois (I2, écrans Maestro).
5. Onglets « Justificatif financier » et « Contrôles » — ❓ aucune photo ne les montre dans la passation : à clarifier avec les cadreurs avant de les construire (périmètre incertain).
