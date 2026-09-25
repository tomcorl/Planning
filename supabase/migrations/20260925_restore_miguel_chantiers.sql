-- ============================================================================
-- CORRECTION : restaurer les vrais chantiers de MIGUEL (Noree)
-- ============================================================================
-- La sauvegarde du 24/09/2026 confirme que l'équipe Noree MIGUEL = 1239
-- possédait réellement ces 23 chantiers.
--
-- Ils avaient été déplacés par erreur vers la ligne d'attente Noree
-- -1000001 lors de la première normalisation.
--
-- Cette migration restaure EXACTEMENT ces IDs sur l'équipe MIGUEL 1239.
-- Aucun autre chantier n'est modifié.
-- ============================================================================

BEGIN;

-- Verrou OCC
SELECT version
FROM public.planning_versions
WHERE id = 1
FOR UPDATE;

-- Marque la correction comme une nouvelle version seulement si au moins
-- un des 23 chantiers est encore sur une ligne d'attente.
UPDATE public.planning_versions
SET version = version + 1,
    updated_at = now()
WHERE id = 1
  AND EXISTS (
    SELECT 1
    FROM public.chantiers
    WHERE company_id = 'noree'
      AND id IN (
        9964, 9969, 9970, 10126, 10186, 10187,
        10275, 10277, 10278, 10908, 11075, 11626,
        13309, 13310, 13479, 13541, 13692, 13829,
        13869, 14088, 14103, 14427, 14433
      )
      AND equipe <> 1239
  );

-- Restauration des vrais chantiers de MIGUEL.
UPDATE public.chantiers
SET equipe = 1239
WHERE company_id = 'noree'
  AND id IN (
    9964, 9969, 9970, 10126, 10186, 10187,
    10275, 10277, 10278, 10908, 11075, 11626,
    13309, 13310, 13479, 13541, 13692, 13829,
    13869, 14088, 14103, 14427, 14433
  )
  AND equipe <> 1239;

COMMIT;

-- ============================================================================
-- VÉRIFICATIONS
-- ============================================================================

SELECT
  id,
  company_id,
  equipe,
  nom
FROM public.chantiers
WHERE company_id = 'noree'
  AND id IN (
    9964, 9969, 9970, 10126, 10186, 10187,
    10275, 10277, 10278, 10908, 11075, 11626,
    13309, 13310, 13479, 13541, 13692, 13829,
    13869, 14088, 14103, 14427, 14433
  )
ORDER BY id;

SELECT
  c.company_id,
  c.equipe,
  COUNT(*) AS nb_chantiers,
  STRING_AGG(c.id::text || ' — ' || c.nom, ' | ' ORDER BY c.id) AS chantiers
FROM public.chantiers c
WHERE c.company_id = 'noree'
  AND c.equipe < 0
GROUP BY c.company_id, c.equipe
ORDER BY c.equipe;

SELECT *
FROM public.planning_versions
WHERE id = 1;
