import { createClient } from '@supabase/supabase-js';

const SUPA_URL = 'https://kzwhkqxjcdldjujmxvzi.supabase.co';
const SUPA_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d2hrcXhqY2RsZGp1am14dnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjI2MTYsImV4cCI6MjA5NTI5ODYxNn0.-uH4gaXv26Qczi0-F9eO694hqmzRSLH521cZI0qnzKE';

export const supabase = createClient(SUPA_URL, SUPA_ANON_KEY);
