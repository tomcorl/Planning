-- Migration: ajout champs chantier + tables vendeurs / types_chantier

-- 1. Chantiers : 6 colonnes (IF NOT EXISTS, ne touche pas note/montant_devis)
ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS client_nom TEXT DEFAULT '';
ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS client_adresse TEXT DEFAULT '';
ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS client_telephone TEXT DEFAULT '';
ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS numero_chantier TEXT DEFAULT '';
ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS "vendeurId" INTEGER DEFAULT 0;
ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS "typeChantierId" INTEGER DEFAULT 0;

-- 2. Tables vendeurs / types_chantier (copie exacte conducteurs)
CREATE TABLE IF NOT EXISTS vendeurs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#2563eb'
);

CREATE TABLE IF NOT EXISTS types_chantier (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#2563eb'
);

-- 3. Données initiales
INSERT INTO vendeurs (nom, color) VALUES
  ('PC', '#2563eb'),
  ('FD', '#16a34a'),
  ('CS', '#f59e0b'),
  ('PN', '#dc2626')
ON CONFLICT (nom) DO NOTHING;

INSERT INTO types_chantier (nom, color) VALUES
  ('Porc', '#f472b6'),
  ('STEP', '#06b6d4'),
  ('Stabule', '#15803d'),
  ('Silo', '#eab308'),
  ('Fosse', '#6b7280'),
  ('Piscine', '#2563eb'),
  ('Indust', '#f97316')
ON CONFLICT (nom) DO NOTHING;

-- 4. RLS (même politique que conducteurs : globale, lecture pour tous les authentifiés)
ALTER TABLE vendeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE types_chantier ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can view all vendeurs" ON vendeurs;
CREATE POLICY "users can view all vendeurs" ON vendeurs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin insert" ON vendeurs;
CREATE POLICY "admin insert" ON vendeurs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'planning'))
);
DROP POLICY IF EXISTS "admin update" ON vendeurs;
CREATE POLICY "admin update" ON vendeurs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'planning'))
);
DROP POLICY IF EXISTS "admin delete" ON vendeurs;
CREATE POLICY "admin delete" ON vendeurs FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'planning'))
);

DROP POLICY IF EXISTS "users can view all types_chantier" ON types_chantier;
CREATE POLICY "users can view all types_chantier" ON types_chantier
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin insert" ON types_chantier;
CREATE POLICY "admin insert" ON types_chantier FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'planning'))
);
DROP POLICY IF EXISTS "admin update" ON types_chantier;
CREATE POLICY "admin update" ON types_chantier FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'planning'))
);
DROP POLICY IF EXISTS "admin delete" ON types_chantier;
CREATE POLICY "admin delete" ON types_chantier FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'planning'))
);
