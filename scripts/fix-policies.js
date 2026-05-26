import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:Planningnoree.22@db.kzwhkqxjcdldjujmxvzi.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

// Drop recursive policies that query profiles table
const dropSql = `
  DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
  DROP POLICY IF EXISTS "admin_select_profiles" ON profiles;
  DROP POLICY IF EXISTS "admin_manage_companies" ON user_companies;
  DROP POLICY IF EXISTS "user_update_own" ON profiles;
`;

await pool.query(dropSql);
console.log('Dropped recursive policies');

// Recreate using JWT claims instead (no recursion)
const policies = [
  `CREATE POLICY "user_self" ON profiles FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid())`,
  `CREATE POLICY "admin_profiles" ON profiles FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')`,
  `CREATE POLICY "user_own_companies" ON user_companies FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())`,
  `CREATE POLICY "admin_companies" ON user_companies FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')`,
];

for (const sql of policies) {
  try {
    await pool.query(sql);
    console.log(`OK: ${sql.slice(0, 70)}...`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

await pool.end();
console.log('Policies updated.');
