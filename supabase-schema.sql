-- ============================================================
-- SCHÉMA COMPLET - Planning Chantier
-- ============================================================

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  secteur TEXT DEFAULT '',
  plan TEXT DEFAULT 'Starter',
  free INTEGER DEFAULT 1
);

INSERT INTO companies (id, nom, secteur, plan, free) VALUES
  ('alpha',  'Alpha TP',     'BTP',           'Pro',    1),
  ('corlay', 'Corlay TP',    'BTP',           'Pro',    1),
  ('demo',   'Démo',         'Démonstration', 'Starter', 1)
ON CONFLICT (id) DO NOTHING;

-- 2. PROFILES (lie les auth.users Supabase aux données métier)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER_COMPANIES (liaison utilisateurs <-> entreprises)
CREATE TABLE IF NOT EXISTS user_companies (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, company_id)
);

-- 4. EQUIPES
CREATE TABLE IF NOT EXISTS equipes (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0
);

-- 5. CONDUCTEURS
CREATE TABLE IF NOT EXISTS conducteurs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2563eb'
);

-- 6. CHANTIERS
CREATE TABLE IF NOT EXISTS chantiers (
  id INTEGER PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  equipe INTEGER NOT NULL DEFAULT 0,
  start TEXT NOT NULL,
  duree INTEGER NOT NULL DEFAULT 1,
  nom TEXT NOT NULL,
  "conducteurId" INTEGER DEFAULT 0,
  color TEXT DEFAULT '#b7c6d8',
  note TEXT DEFAULT '',
  termine INTEGER DEFAULT 0,
  linked INTEGER DEFAULT 0,
  detail TEXT DEFAULT ''
);

-- 7. CONGES
CREATE TABLE IF NOT EXISTS conges (
  id INTEGER PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  equipe INTEGER NOT NULL DEFAULT 0,
  start TEXT NOT NULL,
  duree INTEGER NOT NULL DEFAULT 1,
  nom TEXT DEFAULT 'Congé'
);

-- 8. CUSTOM_FERIES
CREATE TABLE IF NOT EXISTS custom_feries (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  date TEXT NOT NULL
);

-- ============================================================
-- SEED DATA - Chaque entreprise reçoit ses équipes/conducteurs
-- ============================================================

-- Équipes (16 par entreprise)
DO $$
DECLARE
  comp RECORD;
  i INT;
BEGIN
  FOR comp IN SELECT id FROM companies LOOP
    FOR i IN 1..16 LOOP
      INSERT INTO equipes (company_id, nom, ordre)
      VALUES (comp.id, 'Équipe ' || i, i)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Conducteurs (3 par entreprise)
INSERT INTO conducteurs (company_id, nom, color) VALUES
  ('alpha', 'Conducteur 1', '#2563eb'),
  ('alpha', 'Conducteur 2', '#16a34a'),
  ('alpha', 'Conducteur 3', '#dc2626'),
  ('corlay', 'Conducteur 1', '#2563eb'),
  ('corlay', 'Conducteur 2', '#16a34a'),
  ('corlay', 'Conducteur 3', '#dc2626'),
  ('demo', 'Conducteur 1', '#2563eb'),
  ('demo', 'Conducteur 2', '#16a34a'),
  ('demo', 'Conducteur 3', '#dc2626')
ON CONFLICT DO NOTHING;

-- Chantiers (pour l'entreprise alpha, comme dans DEFAULT_CHANTIERS)
INSERT INTO chantiers (id, company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked) VALUES
  (1, 'alpha', 0, '2026-05-04', 10, 'Kervouch',          1, '#b7c6d8', 'Prévoir livraison matériel avant démarrage.', 0, 0),
  (2, 'alpha', 0, '2026-05-18', 6,  'Cosperec énergie',  2, '#c7f9c7', '', 0, 0),
  (3, 'alpha', 1, '2026-05-04', 8,  'Penhoat',           1, '#f9f9c7', '', 0, 0),
  (4, 'alpha', 1, '2026-05-14', 5,  'Kerlouan',          3, '#f9c7c7', '', 0, 0),
  (5, 'alpha', 2, '2026-05-04', 12, 'Roscoff',           2, '#c7e6f9', '', 0, 0),
  (6, 'alpha', 2, '2026-05-20', 4,  'Plouescat',         1, '#f0f0f0', '', 0, 0),
  (7, 'alpha', 0, '2026-06-01', 8,  'Pontivy',           1, '#b7c6d8', '', 0, 0),
  (8, 'alpha', 1, '2026-06-03', 6,  'Lorient',           2, '#c7f9c7', '', 0, 0),
  (9, 'alpha', 2, '2026-06-05', 10, 'Quimper',           3, '#f9c7c7', '', 0, 0),
  (10, 'alpha', 1, '2026-06-12', 5,  'Brest',            1, '#c7e6f9', '', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Congés
INSERT INTO conges (id, company_id, equipe, start, duree, nom) VALUES
  (1, 'alpha', 0, '2026-05-11', 3, 'Congé')
ON CONFLICT (id) DO NOTHING;

-- Activation RLS (sécurité multi-entreprises)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conducteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chantiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conges ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_feries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : un utilisateur ne voit que ses entreprises
CREATE POLICY "users can view own companies" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users can view own company data" ON equipes
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "users can view own company data" ON conducteurs
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "users can view own company data" ON chantiers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "users can view own company data" ON conges
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

CREATE POLICY "users can view own company data" ON custom_feries
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
  );

-- Politiques INSERT/UPDATE/DELETE pour les admins
CREATE POLICY "admin insert" ON chantiers FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin update" ON chantiers FOR UPDATE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin delete" ON chantiers FOR DELETE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);

-- Mêmes politiques pour conges
CREATE POLICY "admin insert" ON conges FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin update" ON conges FOR UPDATE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin delete" ON conges FOR DELETE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);

-- Pour equipes, conducteurs, custom_feries
CREATE POLICY "admin insert" ON equipes FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin update" ON equipes FOR UPDATE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin delete" ON equipes FOR DELETE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);

CREATE POLICY "admin insert" ON conducteurs FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin update" ON conducteurs FOR UPDATE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin delete" ON conducteurs FOR DELETE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);

CREATE POLICY "admin insert" ON custom_feries FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin update" ON custom_feries FOR UPDATE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
CREATE POLICY "admin delete" ON custom_feries FOR DELETE USING (
  company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())
);
