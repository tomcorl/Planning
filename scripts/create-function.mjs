import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:Planningnoree88.@db.nghubxwzikfcynrtehyr.supabase.co:5432/postgres',
});

await pool.query(`
CREATE OR REPLACE FUNCTION replace_chantiers(
  p_company_id TEXT,
  p_chantiers JSONB
) RETURNS SETOF chantiers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM chantiers WHERE company_id = p_company_id;
  RETURN QUERY
  INSERT INTO chantiers (company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail)
  SELECT
    (x->>'company_id')::TEXT,
    (x->>'equipe')::INT,
    (x->>'start')::TEXT,
    (x->>'duree')::INT,
    (x->>'nom')::TEXT,
    (x->>'conducteurId')::INT,
    (x->>'color')::TEXT,
    (x->>'note')::TEXT,
    (x->>'termine')::INT,
    (x->>'linked')::INT,
    (x->>'detail')::TEXT
  FROM jsonb_array_elements(p_chantiers) AS x
  RETURNING *;
END;
$$;
`);

console.log('✓ Function replace_chantiers created');
await pool.end();
