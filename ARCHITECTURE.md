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
