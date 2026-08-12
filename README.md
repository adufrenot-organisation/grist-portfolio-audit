# GRIST. ADMIN & AUDIT PMO — V1

Widget séparé du cockpit métier.

## Onglets
- **Référentiels** : CRUD des axes, objectifs, offres, activités OFS, activités, Team, étapes projet, stades fonctionnalité et fonctionnalités.
- **Audit** : restitution automatique de `JOURNAL_ACTIONS` si la table existe. Colonnes attendues : `Date_Heure`, `Utilisateur`, `Origine`, `Action`, `Table`, `Record_ID`, `Libelle`, `Details`.
- **Diagnostic** : tables détectées et volumétrie.
- **MCD** : affiche `mcd.png`; un sélecteur permet de prévisualiser une nouvelle image. Pour la partager à tous, remplace `mcd.png` dans le dépôt GitHub Pages.

Le widget demande Full document access pour administrer plusieurs tables.
