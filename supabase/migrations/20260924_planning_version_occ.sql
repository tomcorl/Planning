-- ============================================================================
-- OCC planning global : version + save_all_planning_data_v2 + get_planning_version
-- ----------------------------------------------------------------------------
-- SÉCURITÉ :
-- - Ne MODIFIE aucune table métier existante (aucune colonne ajoutée/supprimée).
-- - Ne fait AUCUN CREATE OR REPLACE / DROP sur les fonctions existantes
--   (save_all_planning_data 5 et 7 params, get_planning_data, etc. intacts).
-- - Ne touche ni aux séquences, ni aux RLS/policies, ni aux grants existants.
-- - En cas de conflit de version : ROLLBACK implicite (aucune écriture),
--   la fonction retourne {ok:false, conflict:true, version} AVANT tout write.
-- APPLIQUER via Supabase SQL editor, dans l'ordre du fichier, en UNE fois.
-- VÉRIFICATION manuelle après application (requêtes en bas de fichier).
-- ROLLBACK : DROP FUNCTION save_all_planning_data_v2(...); DROP FUNCTION
--   get_planning_version(); DROP TABLE planning_versions; (puis re-pointer
--   le frontend sur save_all_planning_data v1).
-- ============================================================================

-- ── ÉTAPE 2 : table de version globale (le save est un snapshot global) ─────
CREATE TABLE public.planning_versions (
  id integer PRIMARY KEY,
  version bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Une seule ligne : l'état ACTUEL de la base vaut version 1.
-- Aucune donnée métier n'est lue ni modifiée par ces deux ordres.
INSERT INTO public.planning_versions (id, version) VALUES (1, 1);

GRANT ALL ON TABLE public.planning_versions TO anon;
GRANT ALL ON TABLE public.planning_versions TO authenticated;
GRANT ALL ON TABLE public.planning_versions TO service_role;

-- ── Version courante (lue au chargement / reload pour amorcer versionRef) ──
CREATE FUNCTION public.get_planning_version() RETURNS bigint
  LANGUAGE sql SECURITY DEFINER
  AS $$ SELECT version FROM public.planning_versions WHERE id = 1 $$;

GRANT ALL ON FUNCTION public.get_planning_version() TO anon;
GRANT ALL ON FUNCTION public.get_planning_version() TO authenticated;
GRANT ALL ON FUNCTION public.get_planning_version() TO service_role;

-- ── ÉTAPE 3 : save_all_planning_data_v2 (OCC) ───────────────────────────────
-- Reprend EXACTEMENT le corps métier de la surcharge 7 params actuelle
-- (mêmes DELETE NOT IN, mêmes INSERT/UPDATE, mêmes colonnes), avec :
-- 1. verrou FOR UPDATE + comparaison p_base_version AVANT toute écriture,
--    dans LA MÊME TRANSACTION (fonction plpgsql = transaction de l'appel) ;
-- 2. vendeurs / types_chantier intégrés (upsert par nom, comme le fait
--    aujourd'hui pushNewFieldsDirect côté frontend, mais atomique) ;
-- 3. patch des nouveaux champs chantiers (client_*, vendeurId, typeChantierId,
--    montant_devis) intégré, avec résolution temp→réel par la même clé que le
--    frontend (company|equipe|start|nom|duree) et garde IS DISTINCT FROM ;
-- 4. version incrémentée + retournée ; résultat enrichi (vendeurs,
--    types_chantier) pour les remaps d'IDs côté frontend.
-- Note : le bloc conducteurs dupliqué de la v1 n'est exécuté qu'UNE fois
-- (la 2e exécution était un no-op strict : même payload, mêmes lignes).
CREATE FUNCTION public.save_all_planning_data_v2(
  p_chantiers jsonb,
  p_conges jsonb,
  p_equipes jsonb,
  p_conducteurs jsonb,
  p_custom_feries jsonb,
  p_chantier_colors text[],
  p_conducteur_colors text[],
  p_vendeurs jsonb DEFAULT '[]'::jsonb,
  p_types_chantier jsonb DEFAULT '[]'::jsonb,
  p_base_version bigint DEFAULT NULL
) RETURNS jsonb
  LANGUAGE plpgsql SECURITY DEFINER
  AS $_$
DECLARE
  comp_id TEXT;
  result JSONB;
  v_current BIGINT;
  v_target INT;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;

  -- Verrou + lecture de la version : atomique avec les écritures ci-dessous.
  SELECT version INTO v_current FROM public.planning_versions WHERE id = 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version planning introuvable';
  END IF;

  -- CONFLIT : aucune écriture métier, aucune suppression, version inchangée.
  -- p_base_version NULL (ancien client) = refusé aussi (fail-closed).
  IF p_base_version IS NULL OR p_base_version <> v_current THEN
    RETURN jsonb_build_object('ok', false, 'conflict', true, 'version', v_current);
  END IF;

  FOR comp_id IN SELECT id FROM companies LOOP
    DELETE FROM chantiers WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_chantiers) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
    );
    INSERT INTO chantiers (id, company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail, force_aout)
    SELECT COALESCE((x->>'id')::INT, nextval('chantiers_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, (x->>'conducteurId')::INT, (x->>'color')::TEXT,
           (x->>'note')::TEXT, (x->>'termine')::INT, (x->>'linked')::INT, (x->>'detail')::TEXT, COALESCE((x->>'force_aout')::INT,0)::BOOLEAN
    FROM jsonb_array_elements(p_chantiers) AS x WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, equipe=EXCLUDED.equipe, start=EXCLUDED.start,
      duree=EXCLUDED.duree, nom=EXCLUDED.nom, "conducteurId"=EXCLUDED."conducteurId", color=EXCLUDED.color,
      note=EXCLUDED.note, termine=EXCLUDED.termine, linked=EXCLUDED.linked, detail=EXCLUDED.detail, force_aout=EXCLUDED.force_aout;

    DELETE FROM conges WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conges) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
    );
    INSERT INTO conges (id, company_id, equipe, start, duree, nom, all_equipes)
    SELECT COALESCE((x->>'id')::INT, nextval('conges_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, COALESCE((x->>'all_equipes')::INT,0)
    FROM jsonb_array_elements(p_conges) AS x WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, equipe=EXCLUDED.equipe, start=EXCLUDED.start,
      duree=EXCLUDED.duree, nom=EXCLUDED.nom, all_equipes=EXCLUDED.all_equipes;

    INSERT INTO equipes (id, company_id, nom, ordre)
    SELECT COALESCE(NULLIF((x->>'id')::INT,0), NULLIF((x->>'id')::INT,-2147483648), nextval('equipes_id_seq'::regclass)),
      (x->>'company_id')::TEXT, (x->>'nom')::TEXT, COALESCE((x->>'ordre')::INT,1)
    FROM jsonb_array_elements(p_equipes) AS x WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, nom=EXCLUDED.nom, ordre=EXCLUDED.ordre;

    DELETE FROM equipes WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_equipes) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
      AND NULLIF((x->>'id')::INT,0) IS NOT NULL AND NULLIF((x->>'id')::INT,-2147483648) IS NOT NULL
    );

    DELETE FROM custom_feries WHERE company_id = comp_id;
    INSERT INTO custom_feries (company_id, nom, date)
    SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'date')::TEXT
    FROM jsonb_array_elements(p_custom_feries) AS x WHERE (x->>'company_id') = comp_id;
  END LOOP;

  DELETE FROM conducteurs WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO conducteurs (nom, color) SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_conducteurs) AS r ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  UPDATE companies SET chantier_colors = p_chantier_colors, conducteur_colors = p_conducteur_colors
  WHERE id IN (SELECT id FROM companies);

  -- Vendeurs / types (upsert par nom ; mêmes contraintes UNIQUE que le frontend
  -- utilisait en direct : conducteurs_nom_key, vendeurs_nom_key,
  -- types_chantier_nom_key — toutes vérifiées existantes).
  INSERT INTO vendeurs (nom, color)
  SELECT r->>'nom', COALESCE(r->>'color', '#2563eb')
  FROM jsonb_array_elements(p_vendeurs) AS r
  WHERE (r->>'nom') IS NOT NULL AND (r->>'nom') <> ''
  ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  INSERT INTO types_chantier (nom, color)
  SELECT r->>'nom', COALESCE(r->>'color', '#2563eb')
  FROM jsonb_array_elements(p_types_chantier) AS r
  WHERE (r->>'nom') IS NOT NULL AND (r->>'nom') <> ''
  ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  -- Patch nouveaux champs chantiers (remplace pushNewFieldsDirect frontend).
  -- Résolution temp→réel par la même clé que le frontend
  -- (company|equipe|start|nom|duree) ; garde IS DISTINCT FROM = que les
  -- changements réels, comme le snapshot frontend. Les vendeurId /
  -- typeChantierId temporaires sont écrits tels quels (parité stricte avec
  -- le comportement frontend actuel, quirk connu et inchangé).
  -- NOTE : la colonne de jsonb_array_elements est aliasée (r.elem) car en
  -- plpgsql un SELECT * donnerait un record sans opérateur ->>.
  FOR r IN SELECT elem FROM jsonb_array_elements(p_chantiers) AS elem LOOP
    IF (r.elem->>'id') IS NOT NULL AND (r.elem->>'id') ~ '^-?[0-9]+$' AND NULLIF(r.elem->>'id','')::INT > 0 THEN
      v_target := NULLIF(r.elem->>'id','')::INT;
    ELSE
      SELECT ch.id INTO v_target FROM chantiers ch
      WHERE ch.company_id = (r.elem->>'company_id')::TEXT
        AND ch.equipe = NULLIF(r.elem->>'equipe','')::INT
        AND ch.start = (r.elem->>'start')::TEXT
        AND ch.nom = (r.elem->>'nom')::TEXT
        AND ch.duree = NULLIF(r.elem->>'duree','')::INT
      ORDER BY ch.id DESC LIMIT 1;
    END IF;
    IF v_target IS NOT NULL THEN
      UPDATE chantiers SET
        client_nom = COALESCE((r.elem->>'client_nom'), client_nom),
        client_adresse = COALESCE((r.elem->>'client_adresse'), client_adresse),
        client_telephone = COALESCE((r.elem->>'client_telephone'), client_telephone),
        numero_chantier = COALESCE((r.elem->>'numero_chantier'), numero_chantier),
        "vendeurId" = COALESCE(NULLIF(r.elem->>'vendeurId','')::INT, "vendeurId"),
        "typeChantierId" = COALESCE(NULLIF(r.elem->>'typeChantierId','')::INT, "typeChantierId"),
        montant_devis = COALESCE(NULLIF(r.elem->>'montant_devis','')::INT, montant_devis)
      WHERE id = v_target
        AND (client_nom IS DISTINCT FROM COALESCE((r.elem->>'client_nom'), client_nom)
          OR client_adresse IS DISTINCT FROM COALESCE((r.elem->>'client_adresse'), client_adresse)
          OR client_telephone IS DISTINCT FROM COALESCE((r.elem->>'client_telephone'), client_telephone)
          OR numero_chantier IS DISTINCT FROM COALESCE((r.elem->>'numero_chantier'), numero_chantier)
          OR "vendeurId" IS DISTINCT FROM COALESCE(NULLIF(r.elem->>'vendeurId','')::INT, "vendeurId")
          OR "typeChantierId" IS DISTINCT FROM COALESCE(NULLIF(r.elem->>'typeChantierId','')::INT, "typeChantierId")
          OR montant_devis IS DISTINCT FROM COALESCE(NULLIF(r.elem->>'montant_devis','')::INT, montant_devis));
    END IF;
  END LOOP;

  UPDATE public.planning_versions SET version = v_current + 1, updated_at = now() WHERE id = 1;

  SELECT jsonb_build_object(
    'ok', true, 'conflict', false, 'version', v_current + 1,
    'chantiers',(SELECT jsonb_agg(to_jsonb(ch) ORDER BY ch.id) FROM chantiers ch),
    'conges',(SELECT jsonb_agg(to_jsonb(co) ORDER BY co.id) FROM conges co),
    'equipes',(SELECT jsonb_agg(jsonb_build_object('id',e.id,'nom',e.nom,'company_id',e.company_id,'ordre',e.ordre) ORDER BY e.ordre) FROM equipes e),
    'conducteurs',(SELECT jsonb_agg(jsonb_build_object('id',cd.id,'nom',cd.nom,'color',cd.color) ORDER BY cd.id) FROM conducteurs cd),
    'vendeurs',(SELECT jsonb_agg(jsonb_build_object('id',v.id,'nom',v.nom,'color',v.color) ORDER BY v.id) FROM vendeurs v),
    'types_chantier',(SELECT jsonb_agg(jsonb_build_object('id',t.id,'nom',t.nom,'color',t.color) ORDER BY t.id) FROM types_chantier t),
    'custom_feries',(SELECT jsonb_agg(to_jsonb(cf) ORDER BY cf.id) FROM custom_feries cf)) INTO result;
  RETURN result;
END;
$_$;

ALTER FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) OWNER TO postgres;

GRANT ALL ON FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) TO anon;
GRANT ALL ON FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) TO authenticated;
GRANT ALL ON FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) TO service_role;

-- ============================================================================
-- VÉRIFICATION MANUELLE après application (ne rien exécuter d'autre) :
--   SELECT * FROM planning_versions;                       -- attendu : (1, 1)
--   SELECT count(*) FROM (
--     SELECT proname, oidvectortypes(proargtypes) FROM pg_proc
--     WHERE proname = 'save_all_planning_data') f;          -- attendu : 3 lignes
--     -- (5 params historique, 7 params prod actuelle, v2 OCC)
--   SELECT proname FROM pg_proc WHERE proname = 'get_planning_version';
--   SELECT public.get_planning_version();                    -- attendu : 1
--   -- Comparaison avant/après : counts métier strictement identiques :
--   SELECT (SELECT count(*) FROM chantiers), (SELECT count(*) FROM conges),
--     (SELECT count(*) FROM equipes), (SELECT count(*) FROM conducteurs),
--     (SELECT count(*) FROM vendeurs), (SELECT count(*) FROM types_chantier),
--     (SELECT count(*) FROM custom_feries);
-- ROLLBACK (si besoin) :
--   DROP FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint);
--   DROP FUNCTION public.get_planning_version();
--   DROP TABLE public.planning_versions;
-- ============================================================================
