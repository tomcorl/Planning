import { createClient } from '@supabase/supabase-js';
import { createLocalSupabase } from './localSupabase.js';

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mode local : utilisé quand les clés Supabase sont absentes du .env
export const isLocalMode = import.meta.env.VITE_LOCAL_MODE === 'true' || !(SUPA_URL && SUPA_ANON_KEY);

export const supabase = isLocalMode
  ? createLocalSupabase()
  : createClient(SUPA_URL, SUPA_ANON_KEY);
