-- ============================================================================
-- Normalisation des anciennes lignes "en attente"
-- ============================================================================
-- CONTEXTE :
-- Les lignes d'attente du frontend utilisaient historiquement des IDs positifs
-- calculés à partir du plus grand ID d'équipe. Certains de ces IDs ont ensuite
-- été réutilisés / ont survécu sans équipe réelle.
--
-- Le frontend preview utilise désormais des IDs négatifs réservés :
--   Noree   : -1000001 à -1000005
--   Couvran : -1001001 à -1001003
--   Rat     : -1002001 à -1002003
--
-- Cette migration :
-- 1) prend le verrou OCC sur planning_versions ;
-- 2) déplace les 25 chantiers qui avaient collisionné avec MIGUEL (1239) ;
-- 3) déplace toutes les références orphelines 1252..1261 identifiées ;
-- 4) conserve le groupement par ancien equipe_id autant que possible ;
-- 5) incrémente la version UNIQUEMENT si des lignes ont réellement changé.
--
-- Aucune équipe réelle n'est supprimée.
-- ============================================================================

BEGIN;

-- Verrouille le planning pendant la normalisation.
SELECT version
FROM public.planning_versions
WHERE id = 1
FOR UPDATE;

-- ---------------------------------------------------------------------------
-- Noree
-- Ancienne ligne 1239 (collision MIGUEL) -> attente 1
-- Les anciens IDs orphelins sont répartis sur les 5 lignes d'attente,
-- en conservant chaque ancien equipe_id groupé sur une même ligne.
-- ---------------------------------------------------------------------------
WITH mapping(company_id, old_equipe, new_equipe) AS (
  VALUES
    ('noree', 1239, -1000001),
    ('noree', 1252, -1000001),
    ('noree', 1253, -1000002),
    ('noree', 1254, -1000003),
    ('noree', 1255, -1000004),
    ('noree', 1256, -1000005),
    ('noree', 1259, -1000001)
)
UPDATE public.chantiers c
SET equipe = m.new_equipe
FROM mapping m
WHERE c.company_id = m.company_id
  AND c.equipe = m.old_equipe;

-- ---------------------------------------------------------------------------
-- Couvran
-- ---------------------------------------------------------------------------
WITH mapping(company_id, old_equipe, new_equipe) AS (
  VALUES
    ('couvran', 1254, -1001001),
    ('couvran', 1257, -1001002),
    ('couvran', 1258, -1001003),
    ('couvran', 1259, -1001001),
    ('couvran', 1261, -1001002)
)
UPDATE public.chantiers c
SET equipe = m.new_equipe
FROM mapping m
WHERE c.company_id = m.company_id
  AND c.equipe = m.old_equipe;

-- ---------------------------------------------------------------------------
-- Rat
-- ---------------------------------------------------------------------------
WITH mapping(company_id, old_equipe, new_equipe) AS (
  VALUES
    ('rat', 1258, -1002001),
    ('rat', 1259, -1002002),
    ('rat', 1261, -1002003)
)
UPDATE public.chantiers c
SET equipe = m.new_equipe
FROM mapping m
WHERE c.company_id = m.company_id
  AND c.equipe = m.old_equipe;

-- ---------------------------------------------------------------------------
-- Vérification : aucune référence orpheline historique ne doit subsister.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_remaining integer;
BEGIN
  SELECT COUNT(*)
  INTO v_remaining
  FROM public.chantiers c
  LEFT JOIN public.equipes e ON e.id = c.equipe
  WHERE c.equipe BETWEEN 1239 AND 1262
    AND e.id IS NULL;

  IF v_remaining <> 0 THEN
    RAISE EXCEPTION
      'Normalisation incomplète : % références orphelines restent dans 1239..1262',
      v_remaining;
  END IF;
END;
$$;

-- La modification manuelle doit être visible par OCC comme une nouvelle version.
UPDATE public.planning_versions
SET version = version + 1,
    updated_at = now()
WHERE id = 1
  AND EXISTS (
    SELECT 1
    FROM public.chantiers c
    WHERE c.equipe IN (
      -1000001, -1000002, -1000003, -1000004, -1000005,
      -1001001, -1001002, -1001003,
      -1002001, -1002002, -1002003
    )
  );

COMMIT;

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION (lecture seule)
-- ============================================================================

SELECT
  c.company_id,
  c.equipe,
  COUNT(*) AS nb_chantiers,
  STRING_AGG(c.id::text || ' — ' || c.nom, ' | ' ORDER BY c.id) AS chantiers
FROM public.chantiers c
WHERE c.equipe < 0
GROUP BY c.company_id, c.equipe
ORDER BY c.company_id, c.equipe;

SELECT
  c.company_id,
  c.equipe,
  COUNT(*) AS nb
FROM public.chantiers c
LEFT JOIN public.equipes e ON e.id = c.equipe
WHERE c.equipe IS NOT NULL
  AND e.id IS NULL
GROUP BY c.company_id, c.equipe
ORDER BY c.company_id, c.equipe;

SELECT * FROM public.planning_versions WHERE id = 1;
