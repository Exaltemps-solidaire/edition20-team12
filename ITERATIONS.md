# Plan d'itérations — La Cloche (équipe J7BT47)

- **Source du plan** : proposé par l'agent (aucun plan d'itérations trouvé dans la passation : `cadrage/6-plan-de-livraison.md` est « Pas encore produit », pas de clé `iterations` dans `passation.json`).
- **Plan validé le 2026-11-18**, tel quel (y compris le choix par défaut I1/I2 ci-dessous). **Replanification du 2026-11-18 validée** : stockage en mémoire pour l'Itération 3 confirmé, ordre de priorité du backlog confirmé inchangé.
- **Temps restant annoncé** : ~30 minutes (au lancement de `/planifier-iterations`, le 2026-11-18) ; ~25-30 minutes confirmées au lancement de `/iteration 1` ; **50 minutes re-confirmées au lancement de cette replanification**, après clôture de l'Itération 1.
- **Durée du tour de test de l'équipe** : 5 minutes (confirmée inchangée à la replanification).
- **Temps restant au lancement de l'Itération 2** : 50 minutes (inchangé par rapport à la replanification précédente).
- **Temps restant au lancement de l'Itération 3** : 45 minutes.
- **Temps restant au lancement de l'Itération 4** : 45 minutes (confirmé par le développeur à la validation du plan).
- **Temps restant au lancement de l'Itération 5** : 20 minutes — ⚠️ tendu (codage + publication + tour de test ≈ 18-20 min), lancée malgré tout sur confirmation du développeur ; dernière itération fonctionnelle possible avant stabilisation/pitch si elle déborde.
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

⚠️ **Capacité recalculée (50 min restantes, tour de test 5 min)** : au plafond du budget (10 min codage + 5 min publication + 5 min tour de test = 20 min/itération), 50 min tiennent **2 itérations sûres** (40 min, 10 min de marge), une 3ᵉ possible mais tendue — elle dépend de rester court en codage, comme l'Itération 1 l'a montré (~3,5 min réels). Je détaille l'Itération 2 (déjà posée) et l'Itération 3 ci-dessous ; une 4ᵉ case est réservée, à trancher une fois l'Itération 3 close : itération fonctionnelle de plus si la marge tient, sinon stabilisation avant le pitch.

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
- **Bilan** :
  - **Durée de codage réelle** : ~3 minutes (`.iterations/2.debut`/`.fin`), sans dépassement.
  - **Fait** :
    - Critère 1 : chaque ligne du tableau est cliquable (`onClick` → `/postes/:id`) et ouvre la page détail du poste.
    - Critère 2 : la page détail de P05 affiche les KPIs (couverture, date de falaise, alerte) et le financement Lululemon marqué « financement orphelin — poste vacant », reprenant le cas décrit dans `PASSATION.md` (écran 3).
  - **Décision d'architecture** : type `Position` étendu avec `fundings: Funding[]` (hors plan initial, nécessaire pour servir le critère 2 et réutilisable telle quelle par l'Itération 3) ; route dynamique Next en export statique via `generateStaticParams()` (8 ids connus), compatible avec `output: "export"` sans changement à `nginx.conf` (`try_files` gère déjà `$uri.html`).
  - **Reporté** : rien de nouveau ; `fundings` reste vide (`[]`) pour les 7 autres postes, pas nécessaire pour les critères de cette itération.
  - **Bloqué par le harnais** : rien — contrat sans borne, `npm test` vert (8 tests), signal PM Lab accepté.
  - **Découverte (hors DoD, pendant la mise à jour de la démo)** : `e2e/demo.spec.ts` échoue si rejoué avec `BASE_URL=http://localhost:8080` — attendu, pas un bug : le routage `/api/*` → 8081 est fait par la passerelle d'entrée, absente en local (nginx du front ne sert que du statique). Le script ne peut être validé qu'avec `BASE_URL=$URL_PUBLIQUE`, depuis l'extérieur. Signalé, non bloquant.
  - **Modifications** :
    - `api/src/routes.ts` : type `Funding`, champ `fundings` sur `Position`, données P05 (financement Lululemon orphelin), fonction `findPosition`, route `GET /api/v1/positions/:id` — critères 1 et 2.
    - `api/src/routes.test.ts` : 2 tests ajoutés (détail 200 + 404) — DoD point 2.
    - `frontend/src/app/postes/[id]/page.tsx` : route dynamique, `generateStaticParams`.
    - `frontend/src/app/postes/[id]/position-detail.tsx`, `position-detail.module.css` : composant client, KPIs, liste des financements, mention « financement orphelin » — critère 2.
    - `frontend/src/app/page.tsx`, `page.module.css` : lignes du tableau cliquables (`useRouter().push`) — critère 1.
    - `e2e/demo.spec.ts` : étape de démo ajoutée (clic sur Lyon, financement orphelin visible).

---

## Itération 3 — Plan validé par le développeur le 2026-11-18 : ajouter un financement à un poste

✂️ Le point 1 de l'ancien « À venir » (« saisie des conventions et des postes ») est trop large pour une itération : deux écrans/onglets, et il mélange saisie et recalcul. Je le découpe. Cette itération ne couvre que l'ajout d'un financement à un poste existant (les postes restent ceux d'`api/src/routes.ts`, pas de création de poste) ; le recalcul réel de couverture reste hors périmètre (prochaine itération).

**Stockage, décision prise et validée par le développeur le 2026-11-18** : en mémoire, dans le process API (tableau à côté de `POSITIONS`) — voir `adr.md`. ❗️ Conséquence à garder en tête pour la suite : chaque redéploiement (`--force-recreate`) perd les financements saisis pendant le tour de test précédent ; la démo de l'Itération 4 (calcul réel) devra re-saisir un financement juste après déploiement, ou cette itération-là sèmera une donnée de départ.

- **Dans le périmètre** : formulaire minimal sur la page détail (Itération 2) pour ajouter un financement (financeur, montant ou %, date de fin) ; stockage en mémoire côté API ; le financement ajouté apparaît dans le détail du poste.
- **Hors périmètre** : recalcul automatique de la couverture/alerte à partir des financements saisis (prochaine itération), création/édition de poste, validation avancée, persistance durable.
- **Critères d'acceptation** :
  - Étant donné la page détail d'un poste, quand je soumets le formulaire avec un financeur et un montant, alors le financement apparaît dans la liste du poste.
  - Étant donné un formulaire soumis sans financeur, alors une erreur de validation s'affiche et rien n'est ajouté.
- **Codage estimé** : 8 minutes.
- **Fichiers prévus** : `api/src/routes.ts` (route `POST /api/v1/positions/:id/financements`), `frontend/src/app/postes/[id]/page.tsx` (formulaire).
- **Tests unitaires prévus** : 1-2, sur la validation (financeur manquant rejeté, ajout valide accepté).
- **Bilan** :
  - **Durée de codage réelle** : ~1 minute (`.iterations/3.debut`/`.fin`), très en dessous du budget, aucun dépassement, aucune question d'alarme posée.
  - **Fait** :
    - Critère 1 : `POST /api/v1/positions/:id/financements` avec financeur + montant ajoute le financement, visible dans la réponse et dans la liste affichée sur la page détail (testé en réel sur l'API déployée, poste P04).
    - Critère 2 : un corps sans financeur (ou financeur vide) est rejeté (`400`), rien n'est ajouté ; le formulaire affiche un message d'erreur, les champs restent remplis.
  - **Décision d'architecture** : `startDate` du financement saisi via ce formulaire est fixée à la date du jour côté API (pas de champ dans le formulaire, hors plan initial qui ne prévoyait que financeur/montant/date de fin) ; `router()` et `server.ts` acceptent désormais un corps de requête JSON optionnel (lecture du flux HTTP ajoutée dans `server.ts`), première route POST de l'API.
  - **Reporté** : rien de nouveau pour cette itération ; le recalcul de couverture/alerte à partir des financements saisis reste hors périmètre (déjà prévu en « À venir » point 1).
  - **Bloqué par le harnais** : rien — contrat de déployabilité sans borne (`./scripts/verifier-deployabilite.sh --construire` ; Docker absent de la VM, seul podman est disponible, préconisation non vérifiée comme en 1 et 2), `npm test` vert (14 tests), signal PM Lab accepté du premier coup.
  - **Découverte (hors DoD)** : `localhost:8080/postes/P04/` (avec slash final) répond `403`, contrairement à `localhost:8080/postes/P04` (sans slash) qui répond `200` — comportement préexistant de `nginx.conf`/l'export statique (pas une régression de cette itération), sans impact car le front ne génère jamais de lien avec slash final.
  - **Modifications** :
    - `api/src/routes.ts` : champ `amount` sur `Funding` (déjà présent avant cette itération, repris tel quel), fonction `parseFundingInput`, route `POST /api/v1/positions/:id/financements` — critères 1 et 2.
    - `api/src/server.ts` : lecture du corps de la requête HTTP (JSON), passé à `router()` — nécessaire pour critère 1.
    - `api/src/routes.test.ts` : 3 tests ajoutés (ajout valide via le routeur, validation : financeur manquant/vide, financeur+montant valides) — DoD point 2.
    - `frontend/src/app/postes/[id]/position-detail.tsx`, `position-detail.module.css` : formulaire d'ajout de financement (financeur, montant, date de fin optionnelle), affichage du montant dans la liste, message d'erreur — critères 1 et 2.
    - `e2e/demo.spec.ts` : étape de démo ajoutée (ajout d'un financement, apparition dans la liste) ; non rejouée depuis cette machine (nécessite `BASE_URL=$URL_PUBLIQUE` depuis l'extérieur, cf. découverte de l'Itération 2).

---

## Itération 4 — Plan validé par le développeur le 2026-11-18 : calcul réel de la couverture du mois de référence

✂️ Le point 1 de « À venir » (calcul réel + date de falaise + trous/doublons) est trop large pour une itération : `cadrage/3-solution.md` (§ « Comment ça marche ») précise que le calcul croise les financements avec un **coût mensuel chargé par poste**, un champ qui n'existe pas encore sur `Position`. Je découpe : cette itération ne porte que sur `referenceCoverage` du mois de référence (01/11/2026, cf. Écran 1), à partir des financements actifs ce mois-là ; la date de falaise, les trous/doublons (alerte violet) et l'horizon restent hors périmètre (prochaines itérations).

- **Décision prise par le développeur** : la couverture se déduit du montant du financement rapporté au coût mensuel du poste (pas de % saisi explicitement) — le formulaire de l'Itération 3 (financeur, montant, date de fin) ne change donc pas.
- ❗️ **Conséquence signalée et acceptée** : 7 des 8 postes (tous sauf P05) n'ont aucun financement saisi dans les données en dur ; passer au calcul réel les ferait tous tomber à 0 % (rouge), cassant l'écran de démo. Le développeur a choisi un **backfill inventé** : un coût mensuel et un financement par poste, choisis pour reproduire exactement les % affichés aujourd'hui (tous à 100 % sauf P05 à 0 %). Ces montants sont fictifs, à remplacer dès que l'équipe saisira ses vraies conventions (« À venir », saisie des postes).
- **Dans le périmètre** : champ `monthlyCost` sur `Position` ; fonction pure `computeCoverage(fundings, monthlyCost, referenceDate)` ; `referenceCoverage` recalculé pour les 8 postes à partir de leurs financements actifs au 01/11/2026, plafonné à 100 ; alerte recalculée avec la même règle qu'aujourd'hui (`determineAlert` inchangée).
- **Hors périmètre** : date de falaise recalculée, couverture horizon, détection de doublon (violet), édition/suppression d'un financement existant, champ `monthlyCost` saisissable (reste en dur).
- **Critères d'acceptation** :
  - Étant donné un poste sans financement actif au mois de référence (P05), `referenceCoverage` vaut 0 et l'alerte est rouge.
  - Étant donné un poste avec un financement couvrant tout le coût mensuel au mois de référence, `referenceCoverage` vaut 100.
  - Étant donné un nouveau financement ajouté via le formulaire de l'Itération 3 (ex. P04), son montant contribue au calcul de `referenceCoverage` au prochain chargement de la page détail.
- **Codage estimé** : 8-10 minutes (tendu : touche le type `Position` et les 8 lignes de données en dur).
- **Fichiers prévus** : `api/src/routes.ts`, `api/src/routes.test.ts`.
- **Bilan** :
  - **Durée de codage réelle** : ~2 minutes cumulées (`.iterations/4.debut`/`.fin` pour la première passe ; un correctif a suivi hors chrono, voir ci-dessous), aucun dépassement, aucune question d'alarme posée.
  - **Fait** :
    - Critère 1 : P05 reste à `referenceCoverage: 0`, alerte rouge « Non couvert » (financement Lululemon expiré avant le mois de référence).
    - Critère 2 : les 7 autres postes, avec leur financement de backfill couvrant 100 % du coût mensuel, affichent `referenceCoverage: 100`.
    - Critère 3 : un financement ajouté via le formulaire de l'Itération 3 contribue bien au calcul (vérifié en réel sur l'API déployée, P05 : +2000 € sur un coût mensuel de 4000 € → 50 %, orange).
  - **Bug trouvé et corrigé pendant la vérification, avant signal** : `computeCoverage` comparait les dates au jour près ; un financement saisi via le formulaire reçoit `startDate` = date du jour réel (18/11/2026 ici), postérieure au 1ᵉʳ novembre (date de référence) — il n'était donc jamais compté comme actif, un nouveau financement n'augmentait jamais la couverture affichée (contredit le critère 3). Corrigé en comparant au mois près (`YYYY-MM`), cohérent avec la granularité mensuelle du reste de l'écran ; un test dédié (`compte un financement démarré en cours du mois de référence`) couvre ce cas. Trouvé par un test manuel en conditions réelles sur le poste déployé, pas par un test unitaire — leçon pour la suite : tester un ajout de financement en conditions réelles avant de signaler, pas seulement en données fixes.
  - **Décision d'architecture** : `referenceCoverage` n'est plus un champ stocké sur `Position` mais calculé à la volée (`withComputed`), pour éviter une double source de vérité avec les financements saisis ; remplacé par `monthlyCost` dans le type. Le champ `referenceCoverage` reste présent dans la réponse JSON (même nom), donc aucun changement côté front.
  - **Reporté** : rien de nouveau ; date de falaise, couverture horizon et détection de doublon restent hors périmètre, déjà listées en « À venir ».
  - **Bloqué par le harnais** : rien — contrat de déployabilité sans borne (`--construire`, Docker absent, préconisation non vérifiée comme aux itérations précédentes), `npm test` vert (16 tests), signal PM Lab accepté du premier coup.
  - **Pollution de données hors DoD** : les financements de test ajoutés pendant la vérification (P05, P06) ont été effacés par un redéploiement (`--force-recreate`) avant le signal, pour repartir d'un état cohérent avec la démo — rappel de la conséquence actée en Itération 3 (stockage en mémoire, perdu à chaque redéploiement).
  - **Modifications** :
    - `api/src/routes.ts` : `monthlyCost` remplace `referenceCoverage` sur `Position` ; fonction `computeCoverage` (comparaison au mois près) ; `withComputed` factorise le calcul pour `listPositions`, `findPosition` et la route POST ; backfill des 8 postes (coût mensuel + financement, invariant les % affichés) — critères 1, 2 et 3.
    - `api/src/routes.test.ts` : 3 tests ajoutés sur `computeCoverage` (financement expiré → 0, financement actif couvrant tout → 100, financement démarré en cours de mois de référence → 50) — DoD point 2.
    - `e2e/demo.spec.ts` : étape de démo ajoutée (la couverture affichée change après l'ajout d'un financement) ; non rejouée depuis cette machine (même raison qu'aux itérations 2 et 3).

---

## Itération 5 — Plan validé par le développeur le 2026-11-18 : date de falaise recalculée à partir des financements

- **Dans le périmètre** : `cliffDate`/`monthsBeforeCliff` recalculés à partir de la première date de fin de financement actif après le mois de référence (au lieu des valeurs en dur) ; alerte inchangée (`determineAlert` prend déjà ces deux valeurs en entrée).
- **Hors périmètre** : couverture horizon, détection de doublon (violet), trous entre deux financements consécutifs.
- **Critères d'acceptation (à valider)** :
  - Étant donné un poste dont le financement actif se termine dans moins de 6 mois après le mois de référence, l'alerte est orange avec le bon nombre de mois.
  - Étant donné un poste dont le financement actif n'a pas de date de fin, `cliffDate` est `null` et l'alerte reste verte (si couvert).
- **Codage estimé** : 8-10 minutes.
- **Fichiers prévus** : `api/src/routes.ts`, `api/src/routes.test.ts`.
- **Bilan** :
  - **Temps restant redemandé au lancement** : 15-20 minutes (confirmé par le développeur), tendu mais jouable sur confirmation explicite.
  - **Point de DoR levé avant codage** : les critères d'acceptation portaient la mention « (à valider) » malgré l'en-tête « Plan validé » — incohérence signalée (❗️) ; le développeur a confirmé les critères tels quels avant le lancement du codage.
  - **Durée de codage réelle** : ~0 minute chronométrée (`.iterations/5.debut`/`.fin`) — l'implémentation API (`computeCliff`, `cliffDate`/`monthsBeforeCliff` recalculés, backfill des dates de fin) était déjà présente dans l'arbre de travail au lancement de cette itération (non commitée), avec `ITERATIONS.md` déjà mis à jour (en-tête « Plan validé », lignes de temps restant des Itérations 4 et 5). Seuls les tests unitaires manquaient : ajoutés dans ce créneau. Aucun dépassement, aucune question d'alarme posée.
  - **Fait** :
    - Critère 1 : vérifié en réel sur l'API déployée — P01 (financement actif se terminant le 2026-12-31, soit 1 mois après la référence) renvoie `monthsBeforeCliff: 1` et l'alerte `{"color":"orange","label":"Falaise < 6 mois"}`.
    - Critère 2 : vérifié en réel — P02 (financement actif sans date de fin) renvoie `cliffDate: null`, `monthsBeforeCliff: null`, alerte verte.
  - **Décision d'architecture** : aucune nouvelle ; `computeCliff` suit le même principe que `computeCoverage` (Itération 4) — comparaison au mois près, fonction pure testée indépendamment du routeur.
  - **Reporté** : rien de nouveau pour cette itération ; couverture horizon, détection de doublon (violet) et trous entre financements restent hors périmètre, déjà listés en « À venir ».
  - **Bloqué par le harnais** : rien — `./scripts/verifier-deployabilite.sh` sans borne (Docker absent, podman seul disponible, `--construire` non applicable comme aux itérations précédentes), `npm test` vert (17 tests), signal PM Lab accepté du premier coup.
  - **Modifications** :
    - `api/src/routes.ts` : type `Position` perd `cliffDate`/`monthsBeforeCliff` en champs stockés ; fonction `computeCliff` (première date de fin parmi les financements actifs, comparaison au mois près) ; `withComputed` les calcule à la volée ; backfill des `endDate` des 8 postes pour reproduire les dates de falaise déjà affichées — critères 1 et 2. (Présent dans l'arbre de travail avant le lancement de cette itération.)
    - `api/src/routes.test.ts` : 3 tests ajoutés sur `computeCliff` (falaise à 1 mois, pas de date de fin → null, financement expiré ignoré) — DoD point 2.
    - `e2e/demo.spec.ts` : étape de démo ajoutée (ligne P01 affiche « Falaise < 6 mois » et la date 2026-12-31) ; non rejouée depuis cette machine (même raison qu'aux itérations 2-4 : nécessite `BASE_URL=$URL_PUBLIQUE` depuis l'extérieur).

---

## À venir (ordre de priorité, à détailler au fil de l'eau)

1. Couverture horizon recalculée, détection des trous et doublons (alerte violet/chevauchement) — suite de l'Itération 5.
2. Saisie des postes eux-mêmes (onglet « Postes »), remplaçant le tableau en dur `POSITIONS` — si le temps le permet, sinon les postes restent fixes pour le pitch.
3. Accès différencié par rôle : vue lecture seule pour la responsable d'antenne, sans salaire affiché.
4. Vue stratégique direction : projections à 12, 24 et 36 mois (I2, écrans Maestro).
5. Onglets « Justificatif financier » et « Contrôles » — ❓ aucune photo ne les montre dans la passation : à clarifier avec les cadreurs avant de les construire (périmètre incertain).
