import { supabase } from './supabase.js';

// ─── AUTH ───────────────────────────────────────────────

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

// ─── COMPANY DATA LOADING ──────────────────────────────

export async function loadPlanningData() {
  const { data, error } = await supabase.rpc('get_planning_data');
  if (error) throw error;
  if (!data) return { companies: [], equipes: [], conducteurs: [], chantiers: [], conges: [], customFeries: [] };

  const seenChantier = new Set();
  const dedupedChantiers = (data.chantiers || [])
    .filter((c) => {
      const key = `${c.equipe}|${c.start}|${c.nom}`;
      if (seenChantier.has(key)) return false;
      seenChantier.add(key);
      return true;
    })
    .map(normalizeChantier);

  const seenConge = new Set();
  const dedupedConges = (data.conges || []).filter((c) => {
    const key = `${c.equipe}|${c.start}|${c.nom}`;
    if (seenConge.has(key)) return false;
    seenConge.add(key);
    return true;
  }).map((c) => ({ id: c.id, equipe: c.equipe, start: (c.start || '').split(' ')[0], duree: c.duree, nom: c.nom, allEquipes: !!c.all_equipes, companyId: c.company_id }));

  return {
    companies: data.companies || [],
    equipes: (data.equipes || []).map((e) => ({ nom: e.nom, companyId: e.company_id, ordre: e.ordre })),
    conducteurs: (data.conducteurs || []).map((c) => ({ id: c.id, nom: c.nom, color: c.color, companyId: c.company_id })),
    chantiers: dedupedChantiers,
    conges: dedupedConges,
    customFeries: (data.custom_feries || []).map((f) => ({ ...f, companyId: f.company_id })),
  };
}

export async function updateCompanyColors(companyId, chantierColors, conducteurColors) {
  const { error } = await supabase
    .rpc('update_company_colors', {
      p_company_id: companyId,
      p_chantier_colors: chantierColors,
      p_conducteur_colors: conducteurColors,
    });
  if (error) { console.error('update colors', error); throw error; }
}

function normalizeChantier(c) {
  return {
    id: c.id,
    company_id: c.company_id,
    equipe: c.equipe,
    start: (c.start || '').split(' ')[0],
    duree: c.duree,
    nom: c.nom,
    conducteurId: c.conducteurId,
    color: c.color,
    note: c.note || '',
    termine: !!c.termine,
    linked: !!c.linked,
    detail: c.detail || '',
    force_aout: !!c.force_aout,
  };
}

// ─── DATA MUTATIONS ─────────────────────────────────────

export async function upsertChantiers(chantiers, companyId) {
  const rows = chantiers.map((c) => {
    const row = {
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
      force_aout: c.force_aout ? 1 : 0,
    };
    if (c.id && c.id > 0 && c.id <= 2147483647) row.id = c.id;
    return row;
  });

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

export async function upsertConges(conges, companyId) {
  const rows = conges.map((c) => {
    const row = {
      company_id: companyId,
      equipe: c.equipe,
      start: c.start,
      duree: c.duree,
      nom: c.nom || 'Congé',
      all_equipes: c.allEquipes ? 1 : 0,
    };
    if (c.id && c.id > 0 && c.id <= 2147483647) row.id = c.id;
    return row;
  });

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

export async function upsertEquipes(equipes, companyId) {
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

export async function upsertConducteurs(conducteurs, companyId) {
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

export async function upsertCustomFeries(feries, companyId) {
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

// ─── ADMIN: USERS ────────────────────────────────────────

export async function fetchUsers() {
  // RPC get_users bypasses RLS (requires running the SQL in DB)
  // fallback: direct SELECT (sujet à RLS, ne voit que soi-même)
  const { data, error } = await supabase.rpc('get_users');
  if (!error) return data || [];
  const { data: fb, error: fbErr } = await supabase.from('profiles').select('*');
  if (fbErr) throw fbErr;
  return (fb || []).map((p) => ({ id: p.id, email: p.email, nom: p.nom, role: p.role, must_change_password: !!p.must_change_password }));
}

export async function updateUserProfile(userId, updates) {
  const { error } = await supabase.rpc('update_user_profile', {
    p_user_id: userId,
    p_nom: updates.nom,
    p_role: updates.role,
  });
  if (error) { console.error('update user profile', error); throw error; }
}

export async function createUser(email, password, nom, role) {
  const { data, error } = await supabase.rpc('create_user', {
    p_email: email,
    p_password: password,
    p_nom: nom,
    p_role: role,
    p_company_ids: ['noree'],
  });
  if (error) { console.error('create_user RPC', error); throw error; }
  return data;
}

export async function deleteUser(userId) {
  const { error } = await supabase.rpc('delete_user', {
    p_user_id: userId,
  });
  if (error) { console.error('delete_user RPC', error); throw error; }
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.rpc('update_password', {
    p_new_password: newPassword,
  });
  if (error) { console.error('update_password RPC', error); throw error; }
}
