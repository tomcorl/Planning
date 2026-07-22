# Architecture du projet

## Vue d'ensemble

Application SPA React qui affiche simultanément les plannings de plusieurs entreprises (Norée, Couvran, Le Rat) dans un grid horizontal. Chaque entreprise contient des équipes, chaque équipe peut avoir des chantiers et congés sur une ligne du planning.

---

## Structure des fichiers

```
src/
├── main.jsx                 # Point d'entrée React (StrictMode + render)
├── App.jsx                  # Composant principal (~1800 lignes)
│   ├── État global (sessions, données, thème, sélection, resize)
│   ├── Fonctions utilitaires (dates, jours fériés, calculs)
│   ├── Chargement/sauvegarde des données (via api.js)
│   ├── Logique de drag & drop / resize / sélection de cellules
│   ├── Gestion du calendrier (expansion gauche/droite au scroll)
│   └── Rendu complet : TopBar + PlanningGrid + Modals
├── PlanningGrid.jsx         # Grille du planning (memo React.memo)
│   ├── CellContent (sous-composant memo par cellule)
│   ├── Gestion des événements grille (click, drag, resize, context menu)
│   ├── Headers mois/semaines/dates
│   └── Rendu des lignes équipes avec segments chantiers/congés
├── App.css                  # Styles globaux (~1760 lignes)
├── Modals.jsx               # Modales : édition chantier/congé, couleurs, fériés
├── LoginPage.jsx            # Page de connexion
├── PasswordChangePage.jsx   # Changement de mot de passe (première connexion)
├── AdminUsersPage.jsx       # Gestion des utilisateurs (admin)
├── index.css                # Reset CSS minimal
└── lib/
    ├── supabase.js          # Client Supabase (createClient)
    └── api.js               # Fonctions API : auth, CRUD, RPC Supabase
```

---

## Multi-entreprise

Le planning affiche **toutes les entreprises simultanément**, séparées par des headers visuels :

```
┌──────────────┬───────────────────────────────────────────┐
│              │ Norée construction          [+]           │  ← company-header-row
├──────────────┼───────────────────────────────────────────┤
│    1         │ MIGUEL    (équipier 1)                    │  ← grid-row
├──────────────┼───────────────────────────────────────────┤
│    2         │ José MANUEL (équipier 2)                  │
├──────────────┼───────────────────────────────────────────┤
│   ...        │ ...                                       │
├──────────────┼───────────────────────────────────────────┤
│              │ Couvran                     [+]           │  ← company-header-row
├──────────────┼───────────────────────────────────────────┤
│    1         │ Quentin   (équipier 1)                    │
└──────────────┴───────────────────────────────────────────┘
```

### Comment ça fonctionne :

1. **`gridRows`** (dérivé dans App.jsx) : un tableau ordonné de rows. Pour chaque entreprise, d'abord un `company-header`, puis un `team` row par équipe.
2. La colonne de gauche (`.team-cell`) est **sticky** (`position: sticky; left: 0`) pour rester visible au scroll horizontal.
3. Les headers d'entreprise (`.company-header-row`) sont aussi **sticky** avec un `top` calculé pour rester visible au scroll vertical.
4. Les données sont chargées en **un seul appel RPC** (`get_planning_data`) qui retourne companies + equipes + chantiers + conges + conducteurs + feries pour toutes les entreprises.

### Ajouter une entreprise

Modifier le RPC `get_planning_data()` dans Supabase pour ajouter un `UNION ALL` avec la nouvelle entreprise. Le frontend n'a pas besoin de modification.

---

## Système d'équipes / chantiers / congés

### Équipes
- Stockées dans la table `equipes` avec `company_id`, `nom`, `ordre`
- L'**`id` est auto-généré** (IDENTITY) — c'est l'identifiant stable utilisé par les chantiers/congés
- Le champ `equipe` dans `chantiers` et `conges` fait référence à `equipes.id` (PAS à un index de tableau)

### Chantiers
- Table `chantiers` : `company_id`, `equipe` (réf. à equipes.id), `start` (TEXT, format YYYY-MM-DD), `duree` (jours ouvrés), `nom`, `conducteurId`, `color`, `note`, `detail`, `termine`, `linked`, `force_aout`
- Les chantiers peuvent **dépasser les week-ends et jours fériés** — le système calcule automatiquement les jours ouvrés
- Un chantier peut être **splitté en segments** visuels quand il traverse des jours non-ouvrés

### Congés
- Table `conges` : même structure que chantiers, plus `all_equipes` (booléen)
- `all_equipes = true` : le congé bloque toutes les équipes de l'entreprise

### Conducteurs
- Table `conducteurs` : **globale** (partagée entre toutes les entreprises)
- Champ `nom` (UNIQUE) + `color`
- Associés aux chantiers via `chantiers.conducteurId`

---

## Système d'authentification

1. **Supabase Auth** gère la connexion (email + password)
2. La table `profiles` fait le lien entre `auth.users` et les données métier (role, nom)
3. La table `user_companies` définit quelles entreprises un utilisateur peut voir
4. **RLS (Row Level Security)** : chaque requête SELECT est filtrée par `company_id IN (user_companies de l'utilisateur)`
5. **3 rôles** :
   - `admin` : accès complet + gestion utilisateurs
   - `planning` : peut modifier les chantiers/congés
   - `lecture` : lecture seule

### Création d'utilisateurs
- Le RPC `create_user()` crée l'utilisateur dans `auth.users`, `auth.identities`, `profiles`, et `user_companies`
- Visible uniquement depuis la page "Utilisateurs" (réservée aux admins)

---

## Décisions techniques importantes

### 1. React.memo + memo compare (PlanningGrid.jsx)
Chaque cellule est un composant `CellContent` memoïsé avec une fonction `areEqual` personnalisée. Sans ça, un resize qui change un seul chantier re-renderait les 500+ cellules visibles.

### 2. Cache chantiersParCellule (App.jsx)
Un `useMemo` pré-calcule un `Map<"equipeIndex-dayIdx", segments[]>`. La clé inclut `JSON.stringify(deferredChantiers)` pour invalidation automatique sur toute modification.

### 3. useDeferredValue pour les données
Les chantiers/congés passent par `useDeferredValue` pour ne pas bloquer l'UI pendant le recalcul des segments.

### 4. Résolution des jours ouvrés (nextWorkingDay / countWorkingDays)
Les chantiers stockent leur durée en **jours ouvrés** (hors week-ends et fériés). Le rendu les splitte en segments visuels quand ils traversent des jours non-ouvrés.

### 5. Auto-expansion du calendrier
Au scroll, si l'utilisateur s'approche des bords (< 900px), le calendrier s'étend automatiquement de 100 jours avec un cooldown de 2s.

### 6. Sauvegarde débounce
La sauvegarde Supabase est débounce à 800ms après la dernière modification. Écriture via le RPC `save_all_planning_data` (opération atomique par entreprise).

### 7. Sticky headers d'entreprise
Les headers d'entreprise utilisent `position: sticky; top: {headerHeight}` pour rester visibles au scroll vertical, tout en restant dans le flow normal du grid flex.

### 8. Resize sans native drag
Les chantiers ont `draggable={true}` (pour le drag & drop). Le resize utilise des `mousedown`/`mousemove`/`mouseup` sur le document, avec un ref `resizeDragRef` qui empêche le native HTML5 drag de se déclencher pendant le resize.

### 9. Migration equipe ID stable
Un fichier `migrate-equipe-id.sql` contient la migration de l'ancien système (index de tableau) vers des IDs stables de la table `equipes`. Le flag `equipe_id_migrated` dans `companies` permet de faire cette migration automatiquement au chargement.

---

## Fichiers SQL importants

| Fichier | Rôle |
|---|---|
| `supabase-schema.sql` | Schema complet : tables + RLS + RPC + seed data |
| `migrate-equipe-id.sql` | Migration IDs stables + mise à jour RPC get_planning_data |

---

## Dépendances (package.json)

| Package | Version | Rôle |
|---|---|---|
| react / react-dom | 19.2 | UI |
| @supabase/supabase-js | 2.106 | Client Supabase |
| vite / @vitejs/plugin-react | 8.0 | Build + dev server |
| eslint | 10.3 | Lint |
| rollup-plugin-visualizer | 7.0 | Analyse bundle (dev) |

Aucune autre dépendance — le projet est volontairement léger (pas de router, pas de state manager externe).
