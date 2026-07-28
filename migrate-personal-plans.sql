-- ============================================================
-- MIGRATION : PLANNING PERSONNEL
-- ============================================================

-- 1. personal_plans : un planning perso par utilisateur
CREATE TABLE IF NOT EXISTS personal_plans (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL DEFAULT 'Nouveau planning',
  start_date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. personal_plan_rows : les taches (lignes du grid)
CREATE TABLE IF NOT EXISTS personal_plan_rows (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  plan_id INTEGER NOT NULL REFERENCES personal_plans(id) ON DELETE CASCADE,
  nom TEXT NOT NULL DEFAULT 'Nouvelle tache',
  ordre INTEGER NOT NULL DEFAULT 0
);

-- 3. personal_plan_items : les blocs sur le Gantt
CREATE TABLE IF NOT EXISTS personal_plan_items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  plan_id INTEGER NOT NULL REFERENCES personal_plans(id) ON DELETE CASCADE,
  row_id INTEGER NOT NULL REFERENCES personal_plan_rows(id) ON DELETE CASCADE,
  start TEXT NOT NULL,
  duree INTEGER NOT NULL DEFAULT 1,
  nom TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT '#b7c6d8',
  note TEXT DEFAULT ''
);

-- RLS
ALTER TABLE personal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_plan_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_plan_items ENABLE ROW LEVEL SECURITY;

-- Policies : chaque user ne voit que ses propres plannings
CREATE POLICY "user sees own plans" ON personal_plans
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user inserts own plans" ON personal_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user updates own plans" ON personal_plans
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user deletes own plans" ON personal_plans
  FOR DELETE USING (user_id = auth.uid());

-- Rows
CREATE POLICY "user sees own rows" ON personal_plan_rows
  FOR SELECT USING (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));
CREATE POLICY "user inserts own rows" ON personal_plan_rows
  FOR INSERT WITH CHECK (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));
CREATE POLICY "user updates own rows" ON personal_plan_rows
  FOR UPDATE USING (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));
CREATE POLICY "user deletes own rows" ON personal_plan_rows
  FOR DELETE USING (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));

-- Items
CREATE POLICY "user sees own items" ON personal_plan_items
  FOR SELECT USING (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));
CREATE POLICY "user inserts own items" ON personal_plan_items
  FOR INSERT WITH CHECK (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));
CREATE POLICY "user updates own items" ON personal_plan_items
  FOR UPDATE USING (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));
CREATE POLICY "user deletes own items" ON personal_plan_items
  FOR DELETE USING (plan_id IN (SELECT id FROM personal_plans WHERE user_id = auth.uid()));

-- ============================================================
-- RPC : charger tous les plannings perso de l'utilisateur
-- ============================================================
CREATE OR REPLACE FUNCTION get_personal_plans(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', pp.id,
        'nom', pp.nom,
        'start_date', pp.start_date,
        'created_at', pp.created_at,
        'rows', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object('id', r.id, 'nom', r.nom, 'ordre', r.ordre)
            ORDER BY r.ordre
          ), '[]'::JSONB)
          FROM personal_plan_rows r WHERE r.plan_id = pp.id
        ),
        'items', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object('id', i.id, 'row_id', i.row_id, 'start', i.start, 'duree', i.duree, 'nom', i.nom, 'color', i.color, 'note', COALESCE(i.note, ''))
          ), '[]'::JSONB)
          FROM personal_plan_items i WHERE i.plan_id = pp.id
        )
      )
      ORDER BY pp.created_at
    ), '[]'::JSONB)
    FROM personal_plans pp
    WHERE pp.user_id = p_user_id
  );
END;
$$;

-- ============================================================
-- RPC : sauvegarder un planning perso (rows + items)
-- ============================================================
CREATE OR REPLACE FUNCTION save_personal_plan(
  p_plan_id INTEGER,
  p_rows JSONB,
  p_items JSONB
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM personal_plans WHERE id = p_plan_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acces refuse : ce planning ne vous appartient pas';
  END IF;

  DELETE FROM personal_plan_rows
  WHERE plan_id = p_plan_id
  AND id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_rows) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );

  INSERT INTO personal_plan_rows (id, plan_id, nom, ordre)
  SELECT
    COALESCE((x->>'id')::INT, nextval('personal_plan_rows_id_seq'::regclass)),
    p_plan_id,
    (x->>'nom')::TEXT,
    (x->>'ordre')::INT
  FROM jsonb_array_elements(p_rows) AS x
  ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    ordre = EXCLUDED.ordre;

  DELETE FROM personal_plan_items
  WHERE plan_id = p_plan_id
  AND id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_items) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );

  INSERT INTO personal_plan_items (id, plan_id, row_id, start, duree, nom, color, note)
  SELECT
    COALESCE((x->>'id')::INT, nextval('personal_plan_items_id_seq'::regclass)),
    p_plan_id,
    (x->>'row_id')::INT,
    (x->>'start')::TEXT,
    (x->>'duree')::INT,
    (x->>'nom')::TEXT,
    (x->>'color')::TEXT,
    (x->>'note')::TEXT
  FROM jsonb_array_elements(p_items) AS x
  ON CONFLICT (id) DO UPDATE SET
    row_id = EXCLUDED.row_id,
    start = EXCLUDED.start,
    duree = EXCLUDED.duree,
    nom = EXCLUDED.nom,
    color = EXCLUDED.color,
    note = EXCLUDED.note;
END;
$$;
