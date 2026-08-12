# GRIST. ADMIN & AUDIT PMO — V1.3

Widget séparé du cockpit métier.

## Onglets
- **Référentiels** : CRUD des axes, objectifs, offres, activités OFS, activités, Team, étapes projet, stades fonctionnalité et fonctionnalités.
- **Audit** : restitution automatique de `JOURNAL_ACTIONS` si la table existe. Colonnes attendues : `Date_Heure`, `Utilisateur`, `Origine`, `Action`, `Table`, `Record_ID`, `Libelle`, `Details`.
- **Diagnostic** : tables détectées et volumétrie.
- **MCD** : affiche `mcd.png`; un sélecteur permet de prévisualiser une nouvelle image. Pour la partager à tous, remplace `mcd.png` dans le dépôt GitHub Pages.

Le widget demande Full document access pour administrer plusieurs tables.


## V1.1 — Gestion des domaines

La table `Domaine` est désormais disponible dans l'onglet **Référentiels**.

Colonnes gérées :
- `Code`
- `Nom`
- `Description`

Dans le modèle Grist fourni, aucune colonne de référence vers `Domaine` n'a été détectée.
La suppression n'est donc pas bloquée par des dépendances pour le moment.
Si tu relies ensuite `Domaine` à d'autres tables, il faudra compléter le contrôle de dépendances.


## V1.2 — TEAM_REF et rattachement aux domaines

La table `TEAM_REF` est désormais gérée dans les Référentiels.

Colonnes prises en charge :
- `Code`
- `Libelle`
- `Description`
- `Domaine_code` → référence vers `Domaine`

La suppression d'un `Domaine` est maintenant bloquée tant qu'au moins une ligne `TEAM_REF`
référence ce domaine.

La suppression d'une ligne `TEAM_REF` n'est pas encore bloquée par d'autres dépendances,
car aucune autre relation n'a été confirmée à ce stade.


## V1.3 — Correctif réel de la gestion des domaines

La version précédente n'avait pas intégré `Domaine` dans le code réellement exécuté du widget.

Cette version ajoute effectivement dans **Référentiels** :

### Domaines
Table : `Domaine`

Colonnes :
- `Code`
- `Nom`
- `Description`

### Équipes / TEAM_REF
Table : `TEAM_REF` (avec compatibilité `Team_ref`)

Colonnes :
- `Code`
- `Libelle`
- `Description`
- `Domaine_code` → référence vers `Domaine`

La suppression d'un domaine est bloquée s'il est encore référencé par une ligne TEAM_REF.
