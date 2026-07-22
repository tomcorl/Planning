# Planning Chantier - Dossier de Passation

Application de planning et gestion de chantiers pour entreprises de construction (BTP).  
Multi-entreprise, multi-utilisateurs, avec gestion des équipes, chantiers, congés et conducteurs.

**URL de production :** https://planningnoree.vercel.app  
**Dépôt GitHub :** https://github.com/tomcorl/Planning

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite 8 |
| Backend / BDD | Supabase (PostgreSQL + Auth + RPC) |
| Déploiement | Vercel (auto-deploy depuis `main`) |
| Fonts | Google Fonts (Inter) |

---

## Installation locale

### Prérequis
- Node.js >= 18
- npm

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/tomcorl/Planning.git
cd Planning

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec les vraies clés (voir COMPTES_ACCES.md)

# 4. Lancer le serveur de développement
npm run dev
```

L'app sera accessible sur `http://localhost:5173`.

---

## Build pour la production

```bash
npm run build
```

Le dossier `dist/` contient les fichiers statiques prêts à déployer.  
Vercel déploie automatiquement à chaque push sur `main`.

### Autres commandes utiles

```bash
npm run lint      # Vérifier le code avec ESLint
npm run preview   # Prévisualiser le build locally
```

---

## Comptes de test

Les comptes sont créés via l'interface admin (page "Utilisateurs" visible pour les admins).  
Le RPC `create_user` dans Supabase gère la création + l'assignation aux entreprises.

---

## Données de démonstration

Le script `supabase-schema.sql` contient des INSERT seed (chantiers, congés, équipes par défaut).  
Ces données ne sont insérées que si la table est vide (`ON CONFLICT DO NOTHING`).
