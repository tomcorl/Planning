/* global process */
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPA_URL = 'https://kzwhkqxjcdldjujmxvzi.supabase.co';
const SUPA_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d2hrcXhqY2RsZGp1am14dnppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyMjYxNiwiZXhwIjoyMDk1Mjk4NjE2fQ.JqVhMH4HFijTCL38XQ4OEjfccUnndYCckab9yuoSoOU';
const DB_PASS = 'Planningnoree.22';

const DB_URL = `postgresql://postgres:${encodeURIComponent(DB_PASS)}@db.kzwhkqxjcdldjujmxvzi.supabase.co:5432/postgres`;

async function run() {
  const pool = new pg.Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  const supabase = createClient(SUPA_URL, SUPA_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Run SQL schema (ignore "already exists" errors)
  console.log('Running schema SQL...');
  const sql = readFileSync(resolve(__dirname, '..', 'supabase-schema.sql'), 'utf-8');
  try {
    await pool.query(sql);
    console.log('Schema created.');
  } catch (err) {
    if (err.code === '42710') {
      console.log('Policies already exist (OK).');
    } else {
      console.log('Schema may already exist:', err.message);
    }
  }

  // 2. Create auth users
  console.log('Creating auth users...');
  const users = [
    { email: 'admin@demo.fr', password: '1234', nom: 'Administrateur', role: 'admin', companyIds: ['alpha', 'corlay', 'demo'] },
    { email: 'planning@demo.fr', password: '1234', nom: 'Planning', role: 'planning', companyIds: ['alpha'] },
  ];

  for (const u of users) {
    let uid;

    const r = await supabase.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true,
    });
    if (r.error) {
      console.log(`${u.email}: ${r.error.message}, looking up existing user...`);
      const { data: list } = await supabase.auth.admin.listUsers();
      const found = list?.users?.find(x => x.email === u.email);
      if (!found) { console.error(`Cannot find ${u.email} in auth.users`); continue; }
      uid = found.id;
      console.log(`  found id=${uid}`);
    } else {
      uid = r.data.user.id;
      console.log(`Created ${u.email} (id=${uid})`);
    }

    await pool.query(
      'INSERT INTO profiles (id, email, nom, role) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET nom=$3, role=$4',
      [uid, u.email, u.nom, u.role]
    );
    for (const cid of u.companyIds) {
      await pool.query(
        'INSERT INTO user_companies (user_id, company_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [uid, cid]
      );
    }
    console.log(`  -> profile + company links done`);
  }

  await pool.end();
  console.log('Setup complete!');
  console.log('Login: admin@demo.fr / 1234  |  planning@demo.fr / 1234');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
