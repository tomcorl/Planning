-- RPC get_planning_data : ajoute vendeurs et types_chantier
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
      SELECT jsonb_agg(jsonb_build_object('nom', e.nom, 'company_id', e.company_id, 'ordre', e.ordre))
      FROM (
        SELECT nom, company_id, ordre
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
    'vendeurs', (SELECT jsonb_agg(jsonb_build_object('id', v.id, 'nom', v.nom, 'color', v.color)) FROM vendeurs v),
    'types_chantier', (SELECT jsonb_agg(jsonb_build_object('id', t.id, 'nom', t.nom, 'color', t.color)) FROM types_chantier t),
    'custom_feries', (SELECT jsonb_agg(to_jsonb(cf)) FROM custom_feries cf)
  ) INTO result;
  RETURN result;
END;
$$;

-- RPC save_all_planning_data : ajoute p_vendeurs, p_types_chantier et les 6 champs chantiers
CREATE OR REPLACE FUNCTION save_all_planning_data(
  p_chantiers JSONB,
  p_conges JSONB,
  p_equipes JSONB,
  p_conducteurs JSONB,
  p_custom_feries JSONB,
  p_chantier_colors TEXT[],
  p_conducteur_colors TEXT[],
  p_vendeurs JSONB DEFAULT '[]'::JSONB,
  p_types_chantier JSONB DEFAULT '[]'::JSONB
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
    INSERT INTO chantiers (id, company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail, force_aout, client_nom, client_adresse, client_telephone, numero_chantier, "vendeurId", "typeChantierId", montant_devis)
    SELECT COALESCE((x->>'id')::INT, nextval('chantiers_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT, (x->>'start')::TEXT, (x->>'duree')::INT,
           (x->>'nom')::TEXT, (x->>'conducteurId')::INT, (x->>'color')::TEXT, (x->>'note')::TEXT,
           (x->>'termine')::INT, (x->>'linked')::INT, (x->>'detail')::TEXT, COALESCE((x->>'force_aout')::INT, 0)::BOOLEAN,
           COALESCE((x->>'client_nom')::TEXT, ''), COALESCE((x->>'client_adresse')::TEXT, ''), COALESCE((x->>'client_telephone')::TEXT, ''), COALESCE((x->>'numero_chantier')::TEXT, ''),
           COALESCE((x->>'vendeurId')::INT, 0), COALESCE((x->>'typeChantierId')::INT, 0), COALESCE((x->>'montant_devis')::INT, 0)
    FROM jsonb_array_elements(p_chantiers) AS x
    WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET
      company_id = EXCLUDED.company_id, equipe = EXCLUDED.equipe, start = EXCLUDED.start,
      duree = EXCLUDED.duree, nom = EXCLUDED.nom, "conducteurId" = EXCLUDED."conducteurId",
      color = EXCLUDED.color, note = EXCLUDED.note, termine = EXCLUDED.termine,
      linked = EXCLUDED.linked, detail = EXCLUDED.detail, force_aout = EXCLUDED.force_aout,
      client_nom = EXCLUDED.client_nom, client_adresse = EXCLUDED.client_adresse, client_telephone = EXCLUDED.client_telephone,
      numero_chantier = EXCLUDED.numero_chantier, "vendeurId" = EXCLUDED."vendeurId", "typeChantierId" = EXCLUDED."typeChantierId",
      montant_devis = EXCLUDED.montant_devis;

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

    -- Equipes
    DELETE FROM equipes WHERE company_id = comp_id;
    INSERT INTO equipes (company_id, nom, ordre)
    SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, COALESCE((x->>'ordre')::INT, 1)
    FROM jsonb_array_elements(p_equipes) AS x
    WHERE (x->>'company_id') = comp_id;

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

  -- Vendeurs (globaux)
  DELETE FROM vendeurs
  WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_vendeurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO vendeurs (nom, color)
  SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_vendeurs) AS r
  ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  -- Types chantier (globaux)
  DELETE FROM types_chantier
  WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_types_chantier) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO types_chantier (nom, color)
  SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_types_chantier) AS r
  ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  -- Couleurs
  UPDATE companies SET chantier_colors = p_chantier_colors, conducteur_colors = p_conducteur_colors;

  SELECT jsonb_build_object(
    'chantiers', (SELECT jsonb_agg(to_jsonb(ch) ORDER BY ch.id) FROM chantiers ch),
    'conges', (SELECT jsonb_agg(to_jsonb(co) ORDER BY co.id) FROM conges co),
    'equipes', (SELECT jsonb_agg(jsonb_build_object('nom', e.nom, 'company_id', e.company_id, 'ordre', e.ordre) ORDER BY e.ordre) FROM equipes e),
    'conducteurs', (SELECT jsonb_agg(jsonb_build_object('id', cd.id, 'nom', cd.nom, 'color', cd.color) ORDER BY cd.id) FROM conducteurs cd),
    'vendeurs', (SELECT jsonb_agg(jsonb_build_object('id', v.id, 'nom', v.nom, 'color', v.color) ORDER BY v.id) FROM vendeurs v),
    'types_chantier', (SELECT jsonb_agg(jsonb_build_object('id', t.id, 'nom', t.nom, 'color', t.color) ORDER BY t.id) FROM types_chantier t),
    'custom_feries', (SELECT jsonb_agg(to_jsonb(cf) ORDER BY cf.id) FROM custom_feries cf)
  ) INTO result;
  RETURN result;
END;
$$;

-- RPC upsert_vendeurs (copie de upsert_conducteurs)
CREATE OR REPLACE FUNCTION upsert_vendeurs(p_vendeurs JSONB)
RETURNS SETOF vendeurs LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  r JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  DELETE FROM vendeurs
  WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_vendeurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  FOR r IN SELECT * FROM jsonb_array_elements(p_vendeurs) LOOP
    INSERT INTO vendeurs (nom, color)
    VALUES (r->>'nom', r->>'color')
    ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;
  END LOOP;
  RETURN QUERY SELECT * FROM vendeurs ORDER BY id;
END;
$$;

-- RPC upsert_types_chantier
CREATE OR REPLACE FUNCTION upsert_types_chantier(p_types_chantier JSONB)
RETURNS SETOF types_chantier LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  r JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  DELETE FROM types_chantier
  WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_types_chantier) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  FOR r IN SELECT * FROM jsonb_array_elements(p_types_chantier) LOOP
    INSERT INTO types_chantier (nom, color)
    VALUES (r->>'nom', r->>'color')
    ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;
  END LOOP;
  RETURN QUERY SELECT * FROM types_chantier ORDER BY id;
END;
$$;
