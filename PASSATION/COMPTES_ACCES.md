# Comptes et accès - Services externes

## 1. Supabase (Backend + BDD)

**URL du dashboard :** https://supabase.com/dashboard/project/nghubxwzikfcynrtehyr

| Info | Valeur |
|---|---|
| Project URL | `https://nghubxwzikfcynrtehyr.supabase.co` |
| Anon Key | `sb_publishable_ei8e68BzNbta4lvYKkEovA_HvZF4jR0` |
| Service Key | `sb_secret_9ohs8H8gxxbMiDsqkQCuCQ_U4tBvDBF` |
| DB Connection | `postgresql://postgres:Planningnoree88.@db.nghubxwzikfcynrtehyr.supabase.co:5432/postgres` |

**Pour transférer l'accès :**
1. Aller dans Supabase Dashboard > Project Settings > Team
2. Inviter le nouveau responsable avec le rôle "Owner"
3. Le nouveau responsable crée son propre compte Supabase et accepte l'invitation
4. Une fois le transfert fait, révoquer l'accès de l'ancien propriétaire

**Tables Supabase :**
- companies, profiles, user_companies, equipes, conducteurs, chantiers, conges, custom_feries

**RPC (fonctions stockées) :**
- `get_planning_data()` — chargement toutes entreprises
- `replace_chantiers()`, `replace_conges()`, `replace_equipes()`, `replace_custom_feries()` — CRUD par entreprise
- `upsert_conducteurs()` — CRUD conducteurs (globaux)
- `save_all_planning_data()` — sauvegarde atomique complète
- `create_user()`, `delete_user()`, `update_password()`, `update_user_profile()` — gestion utilisateurs
- `update_all_colors()` — mise à jour couleurs
- `get_users()` — liste utilisateurs (admin)
- `mark_equipes_migrated()` — flag migration IDs

---

## 2. GitHub

**URL du dépôt :** https://github.com/tomcorl/Planning

**Pour transférer l'accès :**
1. Aller dans Settings > Collaborators du dépôt
2. Ajouter le nouveau responsable comme "Admin"
3. Une fois confirmé, retirer l'ancien propriétaire

---

## 3. Vercel (Hébergement + Déploiement)

**URL du dashboard :** https://vercel.com/dashboard/planning-noree  
**URL de production :** https://planningnoree.vercel.app

**Configuration actuelle :**
- Auto-deploy depuis le branch `main` de GitHub
- Rewrite SPA : `/{*}` → `/index.html`
- Variables d'environnement configurées dans Vercel (liées à .env.local)

**Pour transférer l'accès :**
1. Aller dans Vercel Dashboard > Project Settings > Team
2. Inviter le nouveau responsable
3. Ou transférer le projet vers le nouveau compte Vercel
4. Recréer les variables d'environnement (voir .env.example)

---

## 4. Google Fonts

**Usage :** Police Inter (weights 400-900) via CDN Google Fonts  
**URL :** `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap`

**Pour transférer :** Aucune action nécessaire — c'est un service gratuit et public, chargé via `<link>` dans `index.html`.

---

## 5. Variables d'environnement

Voir `.env.example` dans ce dossier pour la liste complète des variables nécessaires.  
Les vraies clés se trouvent dans `.env.local` (à ne JAMAIS versionner) et dans les settings Vercel.

---

## Résumé des transferts

| Service | Action requise | Priorité |
|---|---|---|
| **Supabase** | Inviter comme Owner dans le dashboard | Haute |
| **GitHub** | Ajouter comme Admin du dépôt | Haute |
| **Vercel** | Inviter ou transférer le projet | Haute |
| **Google Fonts** | Rien à faire | - |
| **Variables d'env** | Transmettre `.env.example` + les vraies clés | Haute |
