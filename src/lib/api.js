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

  if (equipes.error) { console.error('load equipes', equipes.error); throw equipes.error; }
  if (conducteurs.error) { console.error('load conducteurs', conducteurs.error); throw conducteurs.error; }
  if (chantiers.error) { console.error('load chantiers', chantiers.error); throw chantiers.error; }
  if (conges.error) { console.error('load conges', conges.error); throw conges.error; }
  if (customFeries.error) { console.error('load custom_feries', customFeries.error); throw customFeries.error; }

  return {
    equipes: equipes.data.map((e) => e.nom),
    conducteurs: conducteurs.data.map((c) => ({ id: c.id, nom: c.nom, color: c.color })),
    chantiers: chantiers.data.map(normalizeChantier),
    conges: conges.data.map((c) => ({ id: c.id, equipe: c.equipe, start: c.start, duree: c.duree, nom: c.nom, allEquipes: !!c.all_equipes })),
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

  if (rows.length === 0) {
    const { error: delErr } = await supabase
      .from('chantiers')
      .delete()
      .eq('company_id', companyId);
    if (delErr) { console.error('delete chantiers error', delErr); throw delErr; }
    return [];
  }

  const { data, error } = await supabase.rpc('replace_chantiers', {
    p_company_id: companyId,
    p_chantiers: rows,
  });

  if (error) { console.error('replace_chantiers error', error); throw error; }
  return data;
}

export async function upsertConges(companyId, conges) {
  const rows = conges.map((c) => ({
    company_id: companyId,
    equipe: c.equipe,
    start: c.start,
    duree: c.duree,
    nom: c.nom || 'Congé',
    all_equipes: c.allEquipes ? 1 : 0,
  }));

  if (rows.length === 0) {
    const { error: delErr } = await supabase
      .from('conges')
      .delete()
      .eq('company_id', companyId);
    if (delErr) { console.error('delete conges', delErr); throw delErr; }
    return;
  }

  const { error } = await supabase.rpc('replace_conges', {
    p_company_id: companyId,
    p_conges: rows,
  });

  if (error) { console.error('replace_conges error', error); throw error; }
}

export async function upsertEquipes(companyId, equipes) {
  const rows = equipes.map((nom, i) => ({
    company_id: companyId,
    nom,
    ordre: i + 1,
  }));

  if (rows.length === 0) {
    const { error: delErr } = await supabase
      .from('equipes')
      .delete()
      .eq('company_id', companyId);
    if (delErr) { console.error('delete equipes', delErr); throw delErr; }
    return;
  }

  const { error } = await supabase.rpc('replace_equipes', {
    p_company_id: companyId,
    p_equipes: rows,
  });

  if (error) { console.error('replace_equipes error', error); throw error; }
}

export async function upsertConducteurs(companyId, conducteurs) {
  const rows = conducteurs.map((c) => ({
    nom: c.nom,
    color: c.color,
  }));

  if (rows.length === 0) return;

  const { data, error } = await supabase.rpc('upsert_conducteurs', {
    p_company_id: companyId,
    p_conducteurs: rows,
  });

  if (error) { console.error('upsert_conducteurs error', error); throw error; }
  return data;
}

export async function upsertCustomFeries(companyId, feries) {
  const rows = feries.map((f) => ({
    company_id: companyId,
    nom: f.nom,
    date: f.date,
  }));

  if (rows.length === 0) {
    const { error: delErr } = await supabase
      .from('custom_feries')
      .delete()
      .eq('company_id', companyId);
    if (delErr) { console.error('delete custom_feries', delErr); throw delErr; }
    return;
  }

  const { error } = await supabase.rpc('replace_custom_feries', {
    p_company_id: companyId,
    p_feries: rows,
  });

  if (error) { console.error('replace_custom_feries error', error); throw error; }
}

// ─── ADMIN: COMPANIES & USERS ────────────────────────────

export async function fetchCompanies() {
  const { data, error } = await supabase.from('companies').select('*');
  if (error) { console.error('fetch companies', error); throw error; }
  return data;
}

export async function saveCompanies(companies) {
  for (const c of companies) {
    const { error } = await supabase.from('companies').upsert({
      id: c.id, nom: c.nom, secteur: c.secteur || '', plan: c.plan || 'Starter', free: 1,
    });
    if (error) { console.error('save company', error); throw error; }
  }
}

export async function fetchUsers() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) { console.error('fetch users', error); throw error; }

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
  if (error) { console.error('update user profile', error); throw error; }

  const { error: delErr } = await supabase
    .from('user_companies')
    .delete()
    .eq('user_id', userId);
  if (delErr) { console.error('delete user companies', delErr); throw delErr; }

  for (const cid of updates.companyIds || []) {
    const { error: linkErr } = await supabase
      .from('user_companies')
      .insert({ user_id: userId, company_id: cid });
    if (linkErr) { console.error('insert user company link', linkErr); throw linkErr; }
  }
}

export async function createUser(email, password, nom, role, companyIds) {
  const { data, error } = await supabase.rpc('create_user', {
    p_email: email,
    p_password: password,
    p_nom: nom,
    p_role: role,
    p_company_ids: companyIds,
  });
  if (!error) return data;

  // Fallback direct (quand le RPC n'est pas encore créé en base)
  console.warn('RPC create_user not available, falling back to direct auth admin call');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (authError) { console.error('create auth user', authError); throw authError; }
  const uid = authData.user.id;

  const { error: profileErr } = await supabase
    .from('profiles')
    .insert({ id: uid, email, nom, role });
  if (profileErr) { console.error('create user profile', profileErr); throw profileErr; }

  for (const cid of companyIds || []) {
    const { error: linkErr } = await supabase
      .from('user_companies')
      .insert({ user_id: uid, company_id: cid });
    if (linkErr) { console.error('create user company link', linkErr); throw linkErr; }
  }

  return { id: uid, email, nom, role, companyIds };
}

export async function deleteUser(userId) {
  const { error: profileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (profileErr) { console.error('delete user profile', profileErr); throw profileErr; }

  const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
  if (authErr) { console.error('delete auth user', authErr); throw authErr; }
}
