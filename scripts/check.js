import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const r = await pool.query(
  "SELECT tablename, (SELECT count(*) FROM pg_catalog.pg_tables t2 WHERE t2.schemaname='public') as total FROM pg_catalog.pg_tables WHERE schemaname='public' ORDER BY tablename"
);
for (const row of r.rows) {
  const cnt = await pool.query(`SELECT count(*) as c FROM "${row.tablename}"`);
  console.log(`${row.tablename}: ${cnt.rows[0].c} rows`);
}
await pool.end();
