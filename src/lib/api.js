import { supabase } from './supabase.js';

// ─── AUTH ───────────────────────────────────────────────

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const session = data.session;
  const user = data.user;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: companies } = await supabase
    .from('user_companies')
    .select('company_id')
    .eq('user_id', user.id);

  const companyIds = companies?.map((c) => c.company_id) || [];

  const { data: companyInfos } = await supabase
    .from('companies')
    .select('*')
    .in('id', companyIds);

  return {
    session,
    profile,
    companyIds,
    companies: companyInfos || [],
  };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ─── COMPANY DATA LOADING ──────────────────────────────

export async function loadCompanyData(companyId) {
  const [equipes, conducteurs, chantiers, conges, customFeries] = await Promise.all([
    supabase.from('equipes').select('*').eq('company_id', companyId).order('ordre'),
    supabase.from('conducteurs').select('*').eq('company_id', companyId),
    supabase.from('chantiers').select('*').eq('company_id', companyId),
    supabase.from('conges').select('*').eq('company_id', companyId),
    supabase.from('custom_feries').select('*').eq('company_id', companyId),
  ]);

  if (equipes.error) throw equipes.error;
  if (conducteurs.error) throw conducteurs.error;
  if (chantiers.error) throw chantiers.error;
  if (conges.error) throw conges.error;
  if (customFeries.error) throw customFeries.error;

  return {
    equipes: equipes.data.map((e) => e.nom),
    conducteurs: conducteurs.data.map((c) => ({ id: c.id, nom: c.nom, color: c.color })),
    chantiers: chantiers.data.map(normalizeChantier),
    conges: conges.data.map((c) => ({ id: c.id, equipe: c.equipe, start: c.start, duree: c.duree, nom: c.nom })),
    customFeries: customFeries.data,
  };
}

function normalizeChantier(c) {
  return {
    id: c.id,
    equipe: c.equipe,
    start: c.start,
    duree: c.duree,
    nom: c.nom,
    conducteurId: c.conducteurId,
    color: c.color,
    note: c.note || '',
    termine: !!c.termine,
    linked: !!c.linked,
    detail: c.detail || '',
  };
}

// ─── DATA MUTATIONS ─────────────────────────────────────

export async function upsertChantiers(companyId, chantiers) {
  const rows = chantiers.map((c) => ({
    id: c.id,
    company_id: companyId,
    equipe: c.equipe,
    start: c.start,
    duree: c.duree,
    nom: c.nom,
    conducteurId: c.conducteurId || 0,
    color: c.color || '#b7c6d8',
    note: c.note || '',
    termine: c.termine ? 1 : 0,
    linked: c.linked ? 1 : 0,
    detail: c.detail || '',
  }));

  // Delete all, then insert (simple approach for undo consistency)
  const { error: delErr } = await supabase
    .from('chantiers')
    .delete()
    .eq('company_id', companyId);

  if (delErr) throw delErr;

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('chantiers').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function upsertConges(companyId, conges) {
  const rows = conges.map((c) => ({
    id: c.id,
    company_id: companyId,
    equipe: c.equipe,
    start: c.start,
    duree: c.duree,
    nom: c.nom || 'Congé',
  }));

  const { error: delErr } = await supabase
    .from('conges')
    .delete()
    .eq('company_id', companyId);

  if (delErr) throw delErr;

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('conges').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function upsertEquipes(companyId, equipes) {
  const { error: delErr } = await supabase
    .from('equipes')
    .delete()
    .eq('company_id', companyId);

  if (delErr) throw delErr;

  const rows = equipes.map((nom, i) => ({
    company_id: companyId,
    nom,
    ordre: i + 1,
  }));

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('equipes').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function upsertConducteurs(companyId, conducteurs) {
  const { error: delErr } = await supabase
    .from('conducteurs')
    .delete()
    .eq('company_id', companyId);

  if (delErr) throw delErr;

  const rows = conducteurs.map((c) => ({
    company_id: companyId,
    nom: c.nom,
    color: c.color,
  }));

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('conducteurs').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function upsertCustomFeries(companyId, feries) {
  const { error: delErr } = await supabase
    .from('custom_feries')
    .delete()
    .eq('company_id', companyId);

  if (delErr) throw delErr;

  const rows = feries.map((f) => ({
    company_id: companyId,
    nom: f.nom,
    date: f.date,
  }));

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('custom_feries').insert(rows);
    if (insErr) throw insErr;
  }
}

// ─── ADMIN: COMPANIES & USERS ────────────────────────────

export async function fetchCompanies() {
  const { data, error } = await supabase.from('companies').select('*');
  if (error) throw error;
  return data;
}

export async function saveCompanies(companies) {
  // Upsert each company individually (safe with FK constraints)
  for (const c of companies) {
    const { error } = await supabase.from('companies').upsert({
      id: c.id, nom: c.nom, secteur: c.secteur || '', plan: c.plan || 'Starter', free: 1,
    });
    if (error) throw error;
  }
}

export async function fetchUsers() {
  // profiles are public, passwords are not stored in profiles
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;

  const enriched = await Promise.all(
    (data || []).map(async (p) => {
      const { data: links } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', p.id);
      return {
        id: p.id,
        email: p.email,
        nom: p.nom,
        role: p.role,
        companyIds: links?.map((l) => l.company_id) || [],
      };
    })
  );

  return enriched;
}

export async function updateUserProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update({ nom: updates.nom, role: updates.role })
    .eq('id', userId);
  if (error) throw error;

  // Update company links: delete all, re-insert
  const { error: delErr } = await supabase
    .from('user_companies')
    .delete()
    .eq('user_id', userId);
  if (delErr) throw delErr;

  for (const cid of updates.companyIds || []) {
    const { error: linkErr } = await supabase
      .from('user_companies')
      .insert({ user_id: userId, company_id: cid });
    if (linkErr) throw linkErr;
  }
}

export async function createUser(email, password, nom, role, companyIds) {
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) throw error;
  const uid = data.user.id;

  const { error: profileErr } = await supabase
    .from('profiles')
    .insert({ id: uid, email, nom, role });
  if (profileErr) throw profileErr;

  for (const cid of companyIds || []) {
    const { error: linkErr } = await supabase
      .from('user_companies')
      .insert({ user_id: uid, company_id: cid });
    if (linkErr) throw linkErr;
  }

  return { id: uid, email, nom, role, companyIds };
}

export async function deleteUser(userId) {
  // Delete profile (cascades to user_companies)
  const { error: profileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (profileErr) throw profileErr;

  // Delete the auth user
  const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
  if (authErr) throw authErr;
}
