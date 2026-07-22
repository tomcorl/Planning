# Bugs connus, TODO et améliorations en attente

## Ce qui fonctionne bien

- Affichage multi-entreprise (Norée + Couvran + Le Rat simultanément)
- CRUD chantiers : création, édition, suppression, drag & drop
- CRUD congés : création, édition, suppression
- Resize des chantiers par glisser-déposer des poignées
- Gestion des équipes (ajout/suppression/modification)
- Système d'authentification multi-rôles (admin, planning, lecture)
- Gestion des utilisateurs (page admin)
- Jours fériés français (calcul automatique + personnalisables)
- Fermeture d'août (1er-21 août, affichée en fond)
- Thème clair/sombre
- Scroll horizontal avec auto-expansion du calendrier
- Sauvegarde automatique débounce (800ms)
- Headers d'entreprise sticky au scroll vertical
- Colonnes d'équipe sticky au scroll horizontal
- Police Inter chargée depuis Google Fonts

---

## En cours / À finaliser

### Migration des IDs d'équipe stable
Le fichier `migrate-equipe-id.sql` contient la migration de l'ancien système (index de tableau) vers des IDs stables de la table `equipes`. Le flag `equipe_id_migrated` dans `companies` permet la migration automatique au chargement.

**État :** Le code côté frontend gère la migration automatique (`companiesMigrated` dans le chargement des données). Le RPC `get_planning_data` retourne le flag. Vérifier que la migration est bien terminée pour toutes les entreprises avant de transférer.

### RPC get_planning_data — entreprises hardcodées
Le RPC `get_planning_data()` contient un `UNION ALL` avec les IDs d'entreprises `noree`, `couvran`, `rat` en dur. **Ajouter une nouvelle entreprise nécessite de modifier ce RPC SQL.** Une amélioration serait de le rendre dynamique (`SELECT * FROM companies`).

### Sauvegarde save_all_planning_data — double DELETE conducteurs
Le RPC `save_all_planning_data()` contient un bug : le bloc de suppression/insertion des conducteurs est exécuté deux fois (une fois dans la boucle des entreprises, une fois en dehors). Cela ne casse rien (le 2ème passage est redondant) mais c'est du code mort à nettoyer.

---

## Améliorations esthétiques en attente

### Z-index des modales
Les modales (édition chantier, congé, couleurs) pourraient avoir un z-index plus robuste pour éviter les chevauchements avec les blocs chantiers en hover (z-index 10000 via CSS). Les headers sticky utilisent déjà z-index 10001. Vérifier la cohérence de la hiérarchie z-index globale.

### Sticky company headers — comportement au scroll
Les headers d'entreprise sont sticky avec un `top` calculé (`headerHeight = 28 + 30 + dateGridH`). Si le layout header change (ajout de rangs, modification des tailles), ce calcul doit être mis à jour manuellement dans `PlanningGrid.jsx`.

### Police des noms d'équipe
Les polices des noms d'équipe (input) et du titre "Équipes" ont été récemment agrandies (19-23px). Vérifier que la lisibilité est bonne sur tous les écrans et que les noms longs ne débordent pas.

### Cellules dates
Les chiffres des dates sont en gras 14px. Le mois et les semaines sont en gras 14px/13px. Les couleurs alternées des mois sont vert clair/vert foncé. Ajuster si nécessaire.

---

## Bugs mineurs connus

| Bug | Impact | Priorité |
|---|---|---|
| Scroll restauré depuis localStorage au lieu d'aller à "Aujourd'hui" au premier chargement | Corrigé (dernière version) | - |
| Bloc chantier ne suit pas le fond vert pendant le resize (multi-segments) | Corrigé (dernière version) | - |
| Cache chantiersParCellule pas invalidé sur modification | Corrigé (dernière version) | - |
| Browser propose traduction anglaise | Corrigé (`lang="fr"` dans index.html) | - |

---

## Pistes d'amélioration (non urgent)

- **Virtualisation des lignes** : le grid rend toutes les lignes d'équipes même si elles ne sont pas visibles. Pour des entreprises avec beaucoup d'équipes (>20), la performance pourrait être améliorée.
- **Mode hors-ligne** : actuellement nécessite une connexion internet. Pourrait utiliser le cache navigateur ou un service worker.
- **Notifications** : pas de système de notification (rappels congés, chantiers bientôt terminés).
- **Export PDF** : pas de fonctionnalité d'export du planning.
- **Recherche** : pas de barre de recherche pour trouver un chantier par nom.
- **Responsive mobile** : l'application n'est pas optimisée pour les écrans mobiles (c'est un outil desktop).
