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


## V1.5.0 — Diagnostic et détail d'audit

### Domaine dans Diagnostic
Le diagnostic affiche maintenant explicitement :
- le nom logique de la table ;
- le nombre de lignes ;
- le **nom de table réellement résolu** dans Grist ;
- l'erreur si la table est inaccessible.

Pour les domaines, le widget teste : `Domaine`, `Domaines`, `DOMAINE`, `DOMAINES`.

### Journal d'actions
La colonne `Details` est maintenant affichée dans un bloc dépliable et formate automatiquement
le JSON lorsqu'il est présent.

Important : le widget Admin ne peut afficher que les détails effectivement enregistrés dans
`JOURNAL_ACTIONS`. La version Cockpit V4.5.1 jointe ajoute désormais ces détails pour les actions
réalisées depuis le cockpit.


## V1.5
Le CRUD `Fonctionnalites` sort du widget Admin & Audit.
Le référentiel `Stades_Fonctionnalite` reste dans l'administration.
La table `Fonctionnalites` peut toujours être chargée en lecture pour le diagnostic et les contrôles de dépendances.


## V1.5.1
Le CRUD `Fonctionnalites` est exclusivement dans le Cockpit PMO. `Stades_Fonctionnalite` reste un référentiel administré ici.


## V1.6.0 — Traçabilité Grist
Onglet dédié à Cree_Par, Cree_Le, Modifie_Par, Modifie_Le sur Projects, Tasks et Fonctionnalites.

## V1.7.0 — Purge du journal

L'onglet Audit permet maintenant :
- de purger les logs de plus de 30 / 90 / 180 / 365 jours ;
- de purger entièrement `JOURNAL_ACTIONS`.

La purge concerne uniquement la table applicative `JOURNAL_ACTIONS`.
Elle ne supprime pas l'historique natif du document Grist ni les colonnes de traçabilité `Cree_*` / `Modifie_*`.

## V1.8.0 — Double MCD

L'onglet **MCD** contient désormais deux sous-vues :
- **MCD Métier PMO** (`mcd-metier.png`)
- **MCD Audit & Traçabilité** (`mcd-audit.png`)

Chaque image peut être prévisualisée séparément depuis l'interface. Pour rendre un remplacement permanent, il faut remplacer le fichier PNG correspondant dans le dépôt publié.

## V1.8.1 — Correctif affichage MCD

Les deux MCD sont maintenant **embarqués directement dans `index.html`** sous forme d'images intégrées.
Ils ne dépendent donc plus du chargement séparé de `mcd-metier.png` / `mcd-audit.png` par GitHub Pages
ou du cache du navigateur.

## V1.9.0 — Menu Documentation

Nouvel onglet **Documentation** dans Admin & Audit.

Table Grist attendue : `Documentation`

Colonnes :
- `Nom` (Text)
- `Icone` (Text, par ex. 📘, 🔗, 🧭, 🛠️)
- `URL` (Text)
- `Ordre` (Numeric)
- `Actif` (Bool)

Vous pouvez créer autant de lignes que nécessaire. Les lignes actives sont lues automatiquement par le Cockpit.

## V1.9.1 — Documentation URL ou pièce jointe

La table `Documentation` accepte maintenant :
- `Type_Document` : `URL` ou `Pièce jointe`
- `URL` : utilisé pour les liens externes
- `Piece_Jointe` : colonne Grist de type **Attachments**

Le formulaire Admin permet de choisir le type. La pièce jointe elle-même est chargée dans la cellule
`Piece_Jointe` de la table Grist native. Admin affiche ensuite son état.


## Import / Export — mapping Produit

La version 2.0 ajoute un onglet **Import / Export** pour visualiser et éditer `mapping-produit.json`, relier visuellement les champs JSON aux colonnes Grist, modifier les règles `identify` et `Ref`, valider puis exporter le mapping. Les modifications de mapping sont conservées localement dans le navigateur jusqu’à export/réinitialisation ; elles ne modifient pas le schéma Grist.
