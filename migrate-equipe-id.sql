-- ============================================================
-- MIGRATION : équipe ID stable (à exécuter UNE SEULE FOIS)
-- ============================================================
-- But : chantiers.equipe et conges.equipe utilisent equipes.id
--       (stable) au lieu de l'index de tableau.
-- ============================================================

-- 1. Flag entreprise pour la migration automatique
ALTER TABLE companies ADD COLUMN IF NOT EXISTS equipe_id_migrated BOOLEAN DEFAULT false;

-- 2. Mise à jour de get_planning_data (inclut id + companies_migrated)
CREATE OR REPLACE FUNCTION get_planning_data()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'companies', (
      SELECT jsonb_agg(jsonb_build_object('id', c.id, 'nom', c.nom, 'chantier_colors', COALESCE(c.chantier_colors, ARRAY['#2563eb','#93c5fd','#eab308','#15803d','#6b7280','#f97316','#7dd3fc']::TEXT[]), 'conducteur_colors', COALESCE(c.conducteur_colors, ARRAY['#2563eb','#16a34a','#dc2626','#9333ea','#ea580c','#0891b2','#ca8a04','#be123c']::TEXT[])))
      FROM (
        SELECT id, nom, chantier_colors, conducteur_colors FROM companies WHERE id = 'noree'
        UNION ALL
        SELECT id, nom, chantier_colors, conducteur_colors FROM companies WHERE id = 'couvran'
        UNION ALL
        SELECT id, nom, chantier_colors, conducteur_colors FROM companies WHERE id = 'rat'
      ) c
    ),
    'equipes', (
      SELECT jsonb_agg(jsonb_build_object('id', e.id, 'nom', e.nom, 'company_id', e.company_id, 'ordre', e.ordre))
      FROM (
        SELECT id, nom, company_id, ordre
        FROM equipes
        ORDER BY
          CASE company_id
            WHEN 'noree' THEN 1
            WHEN 'couvran' THEN 2
            WHEN 'rat' THEN 3
            ELSE 4
          END, ordre
      ) e
    ),
    'chantiers', (SELECT jsonb_agg(to_jsonb(ch)) FROM chantiers ch),
    'conges', (SELECT jsonb_agg(to_jsonb(co)) FROM conges co),
    'conducteurs', (SELECT jsonb_agg(jsonb_build_object('id', cd.id, 'nom', cd.nom, 'color', cd.color)) FROM conducteurs cd),
    'custom_feries', (SELECT jsonb_agg(to_jsonb(cf)) FROM custom_feries cf),
    'companies_migrated', (
      SELECT jsonb_object_agg(id, COALESCE(equipe_id_migrated, false))
      FROM companies
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- 3. Mise à jour de save_all_planning_data (UPSERT equipes au lieu de DELETE+INSERT)
CREATE OR REPLACE FUNCTION save_all_planning_data(
  p_chantiers JSONB,
  p_conges JSONB,
  p_equipes JSONB,
  p_conducteurs JSONB,
  p_custom_feries JSONB,
  p_chantier_colors TEXT[],
  p_conducteur_colors TEXT[]
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  comp_id TEXT;
  result JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;

  FOR comp_id IN SELECT id FROM companies LOOP
    -- Chantiers
    DELETE FROM chantiers
    WHERE company_id = comp_id
    AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_chantiers) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
      AND (x->>'company_id') = comp_id
    );
    INSERT INTO chantiers (id, company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail, force_aout)
    SELECT COALESCE((x->>'id')::INT, nextval('chantiers_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT, (x->>'start')::TEXT, (x->>'duree')::INT,
           (x->>'nom')::TEXT, (x->>'conducteurId')::INT, (x->>'color')::TEXT, (x->>'note')::TEXT,
           (x->>'termine')::INT, (x->>'linked')::INT, (x->>'detail')::TEXT, COALESCE((x->>'force_aout')::INT, 0)::BOOLEAN
    FROM jsonb_array_elements(p_chantiers) AS x
    WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET
      company_id = EXCLUDED.company_id, equipe = EXCLUDED.equipe, start = EXCLUDED.start,
      duree = EXCLUDED.duree, nom = EXCLUDED.nom, "conducteurId" = EXCLUDED."conducteurId",
      color = EXCLUDED.color, note = EXCLUDED.note, termine = EXCLUDED.termine,
      linked = EXCLUDED.linked, detail = EXCLUDED.detail, force_aout = EXCLUDED.force_aout;

    -- Conges
    DELETE FROM conges
    WHERE company_id = comp_id
    AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conges) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
      AND (x->>'company_id') = comp_id
    );
    INSERT INTO conges (id, company_id, equipe, start, duree, nom, all_equipes)
    SELECT COALESCE((x->>'id')::INT, nextval('conges_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, COALESCE((x->>'all_equipes')::INT, 0)
    FROM jsonb_array_elements(p_conges) AS x
    WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET
      company_id = EXCLUDED.company_id, equipe = EXCLUDED.equipe, start = EXCLUDED.start,
      duree = EXCLUDED.duree, nom = EXCLUDED.nom, all_equipes = EXCLUDED.all_equipes;

    -- Equipes : UPSERT pour préserver les IDs stables
    INSERT INTO equipes (id, company_id, nom, ordre)
    SELECT
      COALESCE(
        NULLIF((x->>'id')::INT, 0),
        NULLIF((x->>'id')::INT, -2147483648),
        nextval('equipes_id_seq'::regclass)
      ),
      (x->>'company_id')::TEXT,
      (x->>'nom')::TEXT,
      COALESCE((x->>'ordre')::INT, 1)
    FROM jsonb_array_elements(p_equipes) AS x
    WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET
      company_id = EXCLUDED.company_id,
      nom = EXCLUDED.nom,
      ordre = EXCLUDED.ordre;

    -- Delete equipes NOT in payload (for this company)
    DELETE FROM equipes
    WHERE company_id = comp_id
    AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_equipes) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
      AND (x->>'company_id') = comp_id
      AND NULLIF((x->>'id')::INT, 0) IS NOT NULL
      AND NULLIF((x->>'id')::INT, -2147483648) IS NOT NULL
    );

    -- Custom feries
    DELETE FROM custom_feries WHERE company_id = comp_id;
    INSERT INTO custom_feries (company_id, nom, date)
    SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'date')::TEXT
    FROM jsonb_array_elements(p_custom_feries) AS x
    WHERE (x->>'company_id') = comp_id;
  END LOOP;

  -- Conducteurs (globaux)
  DELETE FROM conducteurs
  WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO conducteurs (nom, color)
  SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_conducteurs) AS r
  ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  -- Couleurs
  UPDATE companies
  SET chantier_colors = p_chantier_colors, conducteur_colors = p_conducteur_colors
  WHERE id IN (SELECT id FROM companies);

  DELETE FROM conducteurs
  WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO conducteurs (nom, color)
  SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_conducteurs) AS r
  ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  SELECT jsonb_build_object(
    'chantiers', (SELECT jsonb_agg(to_jsonb(ch) ORDER BY ch.id) FROM chantiers ch),
    'conges', (SELECT jsonb_agg(to_jsonb(co) ORDER BY co.id) FROM conges co),
    'equipes', (SELECT jsonb_agg(jsonb_build_object('id', e.id, 'nom', e.nom, 'company_id', e.company_id, 'ordre', e.ordre) ORDER BY e.ordre) FROM equipes e),
    'conducteurs', (SELECT jsonb_agg(jsonb_build_object('id', cd.id, 'nom', cd.nom, 'color', cd.color) ORDER BY cd.id) FROM conducteurs cd),
    'custom_feries', (SELECT jsonb_agg(to_jsonb(cf) ORDER BY cf.id) FROM custom_feries cf)
  ) INTO result;
  RETURN result;
END;
$$;

-- 4. RPC pour marquer les entreprises comme migrées
CREATE OR REPLACE FUNCTION mark_equipes_migrated(p_company_ids TEXT[])
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE companies SET equipe_id_migrated = true WHERE id = ANY(p_company_ids);
END;
$$;

-- 5. Mise à jour de replace_equipes pour retourner les IDs
DROP FUNCTION IF EXISTS replace_equipes(TEXT, JSONB);
CREATE OR REPLACE FUNCTION replace_equipes(p_company_id TEXT, p_equipes JSONB)
RETURNS SETOF equipes LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  DELETE FROM equipes WHERE company_id = p_company_id;
  RETURN QUERY
  INSERT INTO equipes (company_id, nom, ordre)
  SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'ordre')::INT
  FROM jsonb_array_elements(p_equipes) AS x
  RETURNING *;
END;
$$;
