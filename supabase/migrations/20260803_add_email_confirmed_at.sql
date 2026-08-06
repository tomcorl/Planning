-- ============================================================
-- MIGRATION ADDITIVE - Statut d'invitation des utilisateurs
-- (migrate-user-invitation.sql)
--
-- Strictement rétro-compatible :
--   - CREATE OR REPLACE d'une seule fonction (get_users)
--   - NE modifie AUCUNE donnée (profiles, auth.users, user_companies)
--   - NE modifie AUCUN RLS existant
--   - NE supprime rien
--   - Ajoute seulement le champ email_confirmed_at (statut) aux
--     utilisateurs, pour distinguer "invitation en attente" (NULL)
--     d'un compte actif (renseigné).
-- ============================================================

-- get_users actuel (pour vérification) :
--   Retourne id / email / nom / role pour chaque profile.
--   Bypass RLS (SECURITY DEFINER), réservé aux admins.
CREATE OR REPLACE FUNCTION get_users()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN '[]'::JSONB;
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',                p.id,
        'email',             p.email,
        'nom',               p.nom,
        'role',              p.role,
        'email_confirmed_at', u.email_confirmed_at
      )
    )
    FROM profiles p
    LEFT JOIN auth.users u ON u.id = p.id
  ), '[]'::JSONB);
END;
$$;