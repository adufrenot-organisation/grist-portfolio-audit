# Architecture — GRIST. ADMIN & AUDIT PMO

Responsabilités : CRUD des référentiels, audit, diagnostic, documentation MCD.
Le cockpit métier et ce widget utilisent le même document Grist : aucune donnée n’est dupliquée.
Grist reste l’unique source de vérité.


## V1.1 — Domaine

Le référentiel `Domaine` est pris en charge par le widget Admin & Audit.

Structure :
- Code
- Nom
- Description

Aucune relation `Ref:Domaine` n'était présente dans le fichier Grist analysé au moment de cette version.


## V1.2 — Domaine → TEAM_REF

Relation prise en charge :

Domaine 1 ─── N TEAM_REF

avec :
`TEAM_REF.Domaine_code -> Domaine`

La suppression d'un domaine est interdite s'il est encore utilisé par TEAM_REF.


## V1.3 — Domaine et TEAM_REF

Relation gérée par le widget :

Domaine 1 ─── N TEAM_REF

`TEAM_REF.Domaine_code -> Domaine`

Le widget accepte aussi l'ancien identifiant de table `Team_ref` pour la lecture,
afin de rester compatible avec les versions antérieures du document.


## V1.4.0

Le diagnostic conserve le nom de table réellement résolu et les erreurs de chargement.
Le rendu Audit sait formater `Details` en JSON lisible.


## V1.5
Séparation métier/référentiel :
- `Fonctionnalites` : CRUD dans Cockpit PMO.
- `Stades_Fonctionnalite` : référentiel CRUD dans Admin & Audit.


## V1.5.1
Fonctionnalites = donnée métier Cockpit. Stades_Fonctionnalite = référentiel Admin.


## V1.6.0
JOURNAL_ACTIONS = audit applicatif. Colonnes Cree_*/Modifie_* = traçabilité des modifications directes Grist.

## V1.7.0 — Rétention des logs
La rétention de `JOURNAL_ACTIONS` est administrable dans le widget Admin & Audit.

## V1.8.0 — Documentation MCD
Deux diagrammes sont embarqués : modèle métier PMO et modèle Audit & Traçabilité.

## V1.8.1
Les images MCD sont embarquées en Data URI afin de garantir leur affichage dans le widget Grist.

## V1.9.0 — Documentation
`Documentation` est une table de configuration administrée dans Admin & Audit et restituée en lecture dans le Cockpit.

## V1.9.1
Documentation supporte deux sources : URL externe ou Attachments Grist.
