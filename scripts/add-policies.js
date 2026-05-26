import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:Planningnoree.22@db.kzwhkqxjcdldjujmxvzi.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const policies = [
  `CREATE POLICY "user_update_own" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid())`,
  `CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`,
  `CREATE POLICY "user_manage_companies" ON user_companies FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())`,
  `CREATE POLICY "admin_manage_companies" ON user_companies FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`,
  `CREATE POLICY "admin_select_profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`,
];

for (const sql of policies) {
  try {
    await pool.query(sql);
    console.log(`OK: ${sql.slice(0, 70)}...`);
  } catch (err) {
    if (err.code === '42710') {
      console.log(`Exists: ${sql.slice(0, 70)}...`);
    } else {
      console.error(`Error: ${err.message}`);
    }
  }
}

await pool.end();
console.log('Policies done.');
