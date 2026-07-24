-- migrate-personal-note.sql
-- Adds note column to personal_plan_items + updates RPCs

-- 1. Add note column
ALTER TABLE personal_plan_items ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';

-- 2. Update get_personal_plans to include note
CREATE OR REPLACE FUNCTION get_personal_plans(p_user_id UUID)
RETURNS JSONB
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',         p.id,
        'nom',        p.nom,
        'start_date', p.start_date,
        'created_at', p.created_at,
        'rows', (
          SELECT COALESCE(jsonb_agg(ragg.r ORDER BY ragg.r->>'ordre'), '[]'::jsonb)
          FROM (
            SELECT jsonb_build_object(
              'id',    pr.id,
              'nom',   pr.nom,
              'ordre', pr.ordre
            ) AS r
            FROM personal_plan_rows pr
            WHERE pr.plan_id = p.id
          ) ragg
        ),
        'items', (
          SELECT COALESCE(jsonb_agg(iagg.i), '[]'::jsonb)
          FROM (
            SELECT jsonb_build_object(
              'id',     pi.id,
              'row_id', pi.row_id,
              'start',  pi.start,
              'duree',  pi.duree,
              'nom',    pi.nom,
              'color',  pi.color,
              'note',   COALESCE(pi.note, '')
            ) AS i
            FROM personal_plan_items pi
            WHERE pi.plan_id = p.id
          ) iagg
        )
      )
      ORDER BY p.created_at DESC
    ),
    '[]'::jsonb
  )
  FROM personal_plans p
  WHERE p.user_id = p_user_id;
$$;

-- 3. Update save_personal_plan RPC to include note
CREATE OR REPLACE FUNCTION save_personal_plan(
  p_plan_id UUID,
  p_rows JSONB,
  p_items JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  r JSONB;
  it JSONB;
  v_row_id BIGINT;
  v_temp_id BIGINT;
  v_new_id BIGINT;
  v_real_row_id BIGINT;
BEGIN
  -- Delete existing rows and cascade items
  DELETE FROM personal_plan_rows WHERE plan_id = p_plan_id;

  -- Insert rows
  FOR r IN SELECT jsonb_array_elements(p_rows)
  LOOP
    v_temp_id := (r->>'temp_id')::bigint;
    INSERT INTO personal_plan_rows (plan_id, nom, ordre)
    VALUES (p_plan_id, r->>'nom', (r->>'ordre')::int)
    RETURNING id INTO v_new_id;

    -- Map temp_id to real id
    IF v_temp_id IS NOT NULL AND v_temp_id < 0 THEN
      -- Store mapping by updating items later
      NULL;
    END IF;

    -- Insert items for this row
    FOR it IN SELECT jsonb_array_elements(
      CASE WHEN p_items IS NOT NULL THEN
        (SELECT jsonb_agg(i) FROM jsonb_array_elements(p_items) i WHERE i->>'row_id' = r->>'temp_id')
      ELSE '[]'::jsonb END
    )
    LOOP
      INSERT INTO personal_plan_items (plan_id, row_id, start, duree, nom, color, note)
      VALUES (
        p_plan_id,
        v_new_id,
        it->>'start',
        (it->>'duree')::int,
        COALESCE(it->>'nom', ''),
        COALESCE(it->>'color', '#b7c6d8'),
        COALESCE(it->>'note', '')
      );
    END LOOP;
  END LOOP;
END;
$$;
