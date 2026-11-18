# Déploiement

Pilotage des financements de postes pour l'association La Cloche : couverture par financeur, alertes (non couvert / falaise proche) et, à terme, projections et justificatifs — voir `cadrage/` dans la passation pour le détail.

## Services

- `frontend/` : export statique Next.js servi par nginx, port 80 (conteneur) — exposé au public sur 8080.
- `api/` : service Node (TypeScript exécuté directement), port 8081 (conteneur) — exposé au public sur 8081, routes sous `/api/v1/...`.

## Services externes

Aucun pour l'instant : aucune donnée réelle persistée, aucun appel à un modèle d'IA ni à un service tiers. Les postes affichés sont des données en dur côté `api/` (voir `api/src/routes.ts`).

## Connu comme fragile ou inachevé

- Données en dur : pas encore de saisie des conventions de financement ni des postes, pas de calcul réel de couverture/date de falaise.
- Alerte violette (chevauchement/double financement) non implémentée : elle suppose le croisement des conventions.
- Pas d'accès différencié par rôle (direction / gestion financière / responsable d'antenne) : une seule vue pour l'instant.

## Contact

- Équipe : Équipe 12 (J7BT47).
- Association : La Cloche.
