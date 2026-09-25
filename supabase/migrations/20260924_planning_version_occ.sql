-- ============================================================================
-- OCC planning global : version + save_all_planning_data_v2 + get_planning_version
-- ----------------------------------------------------------------------------
-- SÉCURITÉ :
-- - Ne MODIFIE aucune table métier existante (aucune colonne ajoutée/supprimée).
-- - Ne fait AUCUN CREATE OR REPLACE / DROP sur les fonctions existantes
--   (save_all_planning_data 5 et 7 params, get_planning_data, etc. intacts).
-- - Ne touche ni aux séquences, ni aux RLS/policies, ni aux grants existants.
-- - planning_versions est VERROUILLÉE : REVOKE total + RLS sans policy
--   (accès direct refusé) ; seules les 2 nouvelles fonctions SECURITY DEFINER
--   y accèdent (lecture version / verrou FOR UPDATE + bump).
-- - En cas de conflit de version : ROLLBACK implicite (aucune écriture),
--   la fonction retourne {ok:false, conflict:true, version} AVANT tout write.
-- APPLIQUER via Supabase SQL editor, dans l'ordre du fichier, en UNE fois.
-- VÉRIFICATION manuelle après application (requêtes en bas de fichier).
-- ROLLBACK : voir bas de fichier (distinguer cas A : v2 jamais utilisée,
--   et cas B : v2 déjà utilisée — les écritures validées restent).
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

-- VERROUILLAGE : planning_versions est une table interne de contrôle OCC.
-- Aucun droit direct pour anon/authenticated (ni SELECT, ni INSERT, ni
-- UPDATE, ni DELETE) + RLS activée SANS policy → tout accès direct est
-- refusé (erreur 42501). La lecture passe UNIQUEMENT par get_planning_version()
-- et les écritures par save_all_planning_data_v2, toutes deux SECURITY DEFINER
-- (exécution en tant que owner postgres → RLS contournée légalement).
REVOKE ALL ON TABLE public.planning_versions FROM anon, authenticated, PUBLIC;
ALTER TABLE public.planning_versions ENABLE ROW LEVEL SECURITY;

-- ── Version courante (lue au chargement / reload pour amorcer versionRef) ──
CREATE FUNCTION public.get_planning_version() RETURNS bigint
  LANGUAGE sql SECURITY DEFINER
  SET search_path = ''
  AS $$ SELECT version FROM public.planning_versions WHERE id = 1 $$;

-- EXECUTE réservé aux rôles authentifiés : l'application est authentifiée,
-- anon n'est jamais nécessaire. REVOKE explicite (défense en profondeur,
-- même si aucun droit n'a été accordé avant).
REVOKE EXECUTE ON FUNCTION public.get_planning_version() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_planning_version() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_planning_version() TO service_role;

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
  SET search_path = ''
  AS $_$
DECLARE
  comp_id TEXT;
  result JSONB;
  v_current BIGINT;
  v_target INT;
  v_real INT;
  v_tmp TEXT;
  -- Mappings déterministes tmp→réel (clé = identifiant temporaire unique par
  -- session frontend, jamais une clé composite ambiguë). Retournés au frontend
  -- pour remapper son état local après ACK (plus de recréation en boucle).
  v_map_ch JSONB := '{}'::jsonb;
  v_map_co JSONB := '{}'::jsonb;
  v_map_eq JSONB := '{}'::jsonb;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'lecture') THEN
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

  FOR comp_id IN SELECT id FROM public.companies LOOP
    DELETE FROM public.chantiers WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_chantiers) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
    );
    -- Lignes réelles uniquement (id entier > 0) : upsert set-based identique v1.
    -- Les lignes temporaires (id absent/invalide/<=0) sont insérées plus bas
    -- en boucle avec RETURNING pour un mapping tmp→réel déterministe.
    INSERT INTO public.chantiers (id, company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail, force_aout)
    SELECT COALESCE((x->>'id')::INT, nextval('public.chantiers_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, (x->>'conducteurId')::INT, (x->>'color')::TEXT,
           (x->>'note')::TEXT, (x->>'termine')::INT, (x->>'linked')::INT, (x->>'detail')::TEXT, COALESCE((x->>'force_aout')::INT,0)::BOOLEAN
    FROM jsonb_array_elements(p_chantiers) AS x WHERE (x->>'company_id') = comp_id
      AND (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'id')::INT > 0
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, equipe=EXCLUDED.equipe, start=EXCLUDED.start,
      duree=EXCLUDED.duree, nom=EXCLUDED.nom, "conducteurId"=EXCLUDED."conducteurId", color=EXCLUDED.color,
      note=EXCLUDED.note, termine=EXCLUDED.termine, linked=EXCLUDED.linked, detail=EXCLUDED.detail, force_aout=EXCLUDED.force_aout;

    DELETE FROM public.conges WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conges) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
    );
    INSERT INTO public.conges (id, company_id, equipe, start, duree, nom, all_equipes)
    SELECT COALESCE((x->>'id')::INT, nextval('public.conges_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, COALESCE((x->>'all_equipes')::INT,0)
    FROM jsonb_array_elements(p_conges) AS x WHERE (x->>'company_id') = comp_id
      AND (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'id')::INT > 0
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, equipe=EXCLUDED.equipe, start=EXCLUDED.start,
      duree=EXCLUDED.duree, nom=EXCLUDED.nom, all_equipes=EXCLUDED.all_equipes;

    DELETE FROM public.equipes WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_equipes) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
      AND NULLIF((x->>'id')::INT,0) IS NOT NULL AND NULLIF((x->>'id')::INT,-2147483648) IS NOT NULL
    );
    INSERT INTO public.equipes (id, company_id, nom, ordre)
    SELECT COALESCE(NULLIF((x->>'id')::INT,0), NULLIF((x->>'id')::INT,-2147483648), nextval('public.equipes_id_seq'::regclass)),
      (x->>'company_id')::TEXT, (x->>'nom')::TEXT, COALESCE((x->>'ordre')::INT,1)
    FROM jsonb_array_elements(p_equipes) AS x WHERE (x->>'company_id') = comp_id
      AND (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'id')::INT > 0
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, nom=EXCLUDED.nom, ordre=EXCLUDED.ordre;

    DELETE FROM public.custom_feries WHERE company_id = comp_id;
    INSERT INTO public.custom_feries (company_id, nom, date)
    SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'date')::TEXT
    FROM jsonb_array_elements(p_custom_feries) AS x WHERE (x->>'company_id') = comp_id;
  END LOOP;

  -- Lignes temporaires (id absent/invalide/<=0) : INSERT un par un avec
  -- RETURNING pour un mapping tmp→réel EXACT (pas de clé composite).
  -- Les lignes réelles (> 0) ont déjà été traitées par les upserts set-based.
  FOR r IN SELECT elem FROM jsonb_array_elements(p_chantiers) AS elem LOOP
    IF (r.elem->>'id') IS NOT NULL AND (r.elem->>'id') ~ '^-?[0-9]+$' AND (r.elem->>'id')::INT > 0 THEN
      CONTINUE;
    END IF;
    INSERT INTO public.chantiers (company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail, force_aout)
    VALUES ((r.elem->>'company_id')::TEXT, (r.elem->>'equipe')::INT,
      (r.elem->>'start')::TEXT, (r.elem->>'duree')::INT, (r.elem->>'nom')::TEXT, (r.elem->>'conducteurId')::INT, (r.elem->>'color')::TEXT,
      (r.elem->>'note')::TEXT, (r.elem->>'termine')::INT, (r.elem->>'linked')::INT, (r.elem->>'detail')::TEXT, COALESCE((r.elem->>'force_aout')::INT,0)::BOOLEAN)
    RETURNING id INTO v_real;
    v_tmp := r.elem->>'tmp';
    IF v_tmp IS NOT NULL THEN
      v_map_ch := v_map_ch || jsonb_build_object(v_tmp, v_real);
      -- L'ancienne ligne temporaire mappée est supprimée : elle vient d'être
      -- remplacée par l'ID positif (aucune ligne négative restante).
      -- Garde regex : cast sûr uniquement. Si la ligne n'existe pas (temp
      -- jamais persistée, ou déjà supprimée par le DELETE NOT IN), no-op.
      IF v_tmp ~ '^-?[0-9]+$' THEN
        DELETE FROM public.chantiers WHERE id = v_tmp::INT;
      END IF;
    END IF;
  END LOOP;

  FOR r IN SELECT elem FROM jsonb_array_elements(p_conges) AS elem LOOP
    IF (r.elem->>'id') IS NOT NULL AND (r.elem->>'id') ~ '^-?[0-9]+$' AND (r.elem->>'id')::INT > 0 THEN
      CONTINUE;
    END IF;
    INSERT INTO public.conges (company_id, equipe, start, duree, nom, all_equipes)
    VALUES ((r.elem->>'company_id')::TEXT, (r.elem->>'equipe')::INT,
      (r.elem->>'start')::TEXT, (r.elem->>'duree')::INT, (r.elem->>'nom')::TEXT, COALESCE((r.elem->>'all_equipes')::INT,0))
    RETURNING id INTO v_real;
    v_tmp := r.elem->>'tmp';
    IF v_tmp IS NOT NULL THEN
      v_map_co := v_map_co || jsonb_build_object(v_tmp, v_real);
      -- Idem chantiers : suppression de l'ancienne ligne temporaire mappée.
      IF v_tmp ~ '^-?[0-9]+$' THEN
        DELETE FROM public.conges WHERE id = v_tmp::INT;
      END IF;
    END IF;
  END LOOP;

  FOR r IN SELECT elem FROM jsonb_array_elements(p_equipes) AS elem LOOP
    IF (r.elem->>'id') IS NOT NULL AND (r.elem->>'id') ~ '^-?[0-9]+$' AND (r.elem->>'id')::INT > 0 THEN
      CONTINUE;
    END IF;
    INSERT INTO public.equipes (company_id, nom, ordre)
    VALUES ((r.elem->>'company_id')::TEXT, (r.elem->>'nom')::TEXT, COALESCE((r.elem->>'ordre')::INT,1))
    RETURNING id INTO v_real;
    v_tmp := r.elem->>'tmp';
    IF v_tmp IS NOT NULL THEN
      v_map_eq := v_map_eq || jsonb_build_object(v_tmp, v_real);
      IF v_tmp ~ '^-?[0-9]+$' THEN
        -- Remap des références AVANT suppression (même transaction) : les
        -- lignes chantiers/conges pointant vers l'ancienne équipe temporaire
        -- (y compris celles écrites plus haut dans ce save) basculent sur
        -- le nouvel ID positif. Puis suppression de l'ancienne équipe mappée.
        UPDATE public.chantiers SET equipe = v_real WHERE equipe = v_tmp::INT;
        UPDATE public.conges SET equipe = v_real WHERE equipe = v_tmp::INT;
        DELETE FROM public.equipes WHERE id = v_tmp::INT;
      END IF;
    END IF;
  END LOOP;

  DELETE FROM public.conducteurs WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO public.conducteurs (nom, color) SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_conducteurs) AS r ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  UPDATE public.companies SET chantier_colors = p_chantier_colors, conducteur_colors = p_conducteur_colors
  WHERE id IN (SELECT id FROM public.companies);

  -- Vendeurs / types (upsert par nom ; mêmes contraintes UNIQUE que le frontend
  -- utilisait en direct : conducteurs_nom_key, vendeurs_nom_key,
  -- types_chantier_nom_key — toutes vérifiées existantes).
  INSERT INTO public.vendeurs (nom, color)
  SELECT r->>'nom', COALESCE(r->>'color', '#2563eb')
  FROM jsonb_array_elements(p_vendeurs) AS r
  WHERE (r->>'nom') IS NOT NULL AND (r->>'nom') <> ''
  ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  INSERT INTO public.types_chantier (nom, color)
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
    ELSIF (r.elem->>'tmp') IS NOT NULL AND (v_map_ch ? (r.elem->>'tmp')) THEN
      -- Mapping déterministe issu de l'INSERT RETURNING ci-dessus.
      v_target := (v_map_ch->>(r.elem->>'tmp'))::INT;
    ELSE
      SELECT ch.id INTO v_target FROM public.chantiers ch
      WHERE ch.company_id = (r.elem->>'company_id')::TEXT
        AND ch.equipe = NULLIF(r.elem->>'equipe','')::INT
        AND ch.start = (r.elem->>'start')::TEXT
        AND ch.nom = (r.elem->>'nom')::TEXT
        AND ch.duree = NULLIF(r.elem->>'duree','')::INT
      ORDER BY ch.id DESC LIMIT 1;
    END IF;
    IF v_target IS NOT NULL THEN
      UPDATE public.chantiers SET
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
    'chantier_id_map', v_map_ch, 'conge_id_map', v_map_co, 'equipe_id_map', v_map_eq,
    'chantiers',(SELECT jsonb_agg(to_jsonb(ch) ORDER BY ch.id) FROM public.chantiers ch),
    'conges',(SELECT jsonb_agg(to_jsonb(co) ORDER BY co.id) FROM public.conges co),
    'equipes',(SELECT jsonb_agg(jsonb_build_object('id',e.id,'nom',e.nom,'company_id',e.company_id,'ordre',e.ordre) ORDER BY e.ordre) FROM public.equipes e),
    'conducteurs',(SELECT jsonb_agg(jsonb_build_object('id',cd.id,'nom',cd.nom,'color',cd.color) ORDER BY cd.id) FROM public.conducteurs cd),
    'vendeurs',(SELECT jsonb_agg(jsonb_build_object('id',v.id,'nom',v.nom,'color',v.color) ORDER BY v.id) FROM public.vendeurs v),
    'types_chantier',(SELECT jsonb_agg(jsonb_build_object('id',t.id,'nom',t.nom,'color',t.color) ORDER BY t.id) FROM public.types_chantier t),
    'custom_feries',(SELECT jsonb_agg(to_jsonb(cf) ORDER BY cf.id) FROM public.custom_feries cf)) INTO result;
  RETURN result;
END;
$_$;

ALTER FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) OWNER TO postgres;

-- EXECUTE réservé aux rôles authentifiés (même principe que ci-dessus).
REVOKE EXECUTE ON FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint) TO service_role;

-- ============================================================================
-- VÉRIFICATION MANUELLE après application (lecture seule d'abord) :
--   SELECT * FROM planning_versions;                       -- attendu : (1, 1)
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'planning_versions';
--                                                          -- attendu : true (RLS active)
--   SELECT * FROM pg_policies WHERE tablename = 'planning_versions';
--                                                          -- attendu : 0 ligne (aucune policy = refus total direct)
--   SELECT
--     proname,
--     oidvectortypes(proargtypes)
--   FROM pg_proc
--   WHERE proname IN (
--     'save_all_planning_data',
--     'save_all_planning_data_v2'
--   )
--   ORDER BY proname, oidvectortypes(proargtypes);
--   -- attendu : 3 lignes =
--   --   save_all_planning_data 5 params (historique, non utilisée),
--   --   save_all_planning_data 7 params (prod actuelle),
--   --   save_all_planning_data_v2 10 params (nouvelle OCC).
--   SELECT proname FROM pg_proc WHERE proname = 'get_planning_version';
--   SELECT public.get_planning_version();                    -- attendu : 1
--   -- Comparaison avant/après : counts métier strictement identiques :
--   SELECT (SELECT count(*) FROM chantiers), (SELECT count(*) FROM conges),
--     (SELECT count(*) FROM equipes), (SELECT count(*) FROM conducteurs),
--     (SELECT count(*) FROM vendeurs), (SELECT count(*) FROM types_chantier),
--     (SELECT count(*) FROM custom_feries);
--
-- VERROUILLAGE (à exécuter UNE PAR UNE, rôle postgres requis pour SET ROLE ;
-- chaque ordre en écriture DOIT échouer avec 42501, sans rien modifier) :
--   SET ROLE authenticated;
--   UPDATE planning_versions SET version = 999 WHERE id = 1;  -- attendu : ERREUR 42501
--   DELETE FROM planning_versions WHERE id = 1;               -- attendu : ERREUR 42501
--   INSERT INTO planning_versions (id, version) VALUES (2, 1);-- attendu : ERREUR 42501
--   SELECT * FROM planning_versions;                          -- attendu : ERREUR 42501
--   RESET ROLE;
--   SELECT * FROM planning_versions;  -- attendu : toujours (1, 1), rien n'a bougé
--
-- FONCTIONNEMENT via SECURITY DEFINER (zéro écriture métier) :
--   -- Chemin conflit (base volontairement fausse) : prouve que la v2
--   -- s'exécute (rôle + version comparée) SANS rien écrire :
--   SELECT public.save_all_planning_data_v2('[]','[]','[]','[]','[]','{}','{}','[]','[]',0);
--   -- attendu : {"ok": false, "conflict": true, "version": 1}
--   SELECT * FROM planning_versions;  -- attendu : toujours (1, 1)
--   -- Le chemin ok:true (écriture réelle + version 2) ne peut être testé
--   -- SANS modifier la base : le tester en PREVIEW après application, jamais
--   -- en aveugle en production.
--
-- ROLLBACK — DISTINGUER DEUX CAS :
--   A. Migration installée mais v2 JAMAIS utilisée (version toujours à 1,
--      frontend jamais passé sur v2) : suppression complète possible, la base
--      métier est strictement identique à avant :
--        DROP FUNCTION public.save_all_planning_data_v2(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[], jsonb, jsonb, bigint);
--        DROP FUNCTION public.get_planning_version();
--        DROP TABLE public.planning_versions;
--   B. v2 DÉJÀ utilisée (version > 1, saves commits validés) : un retour
--      frontend vers la v1 est possible (l'ancienne RPC est intacte), MAIS les
--      écritures déjà validées par la v2 RESTENT dans les tables métier.
--      Supprimer v2 + planning_versions dans ce cas ne restaure AUCUNE donnée
--      antérieure — seul un restore du backup pré-migration le ferait.
-- ============================================================================
