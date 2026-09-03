import { supabase } from './supabase.js';

// ─── AUTH ───────────────────────────────────────────────

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Invite un utilisateur par email (Edge Function invite-user).
// L'email d'invitation est envoyé par SMTP ; l'utilisateur définira
// son mot de passe en cliquant le lien.
export async function inviteUser(email, nom, role, companyIds = []) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non connecté');

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, nom, role, companyIds }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || 'Erreur lors de l\'envoi de l\'invitation');
  return body;
}

// Envoie un email de réinitialisation de mot de passe (GoTrue)
// à l'utilisateur concerné.
export async function resetUserPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: APP_URL,
  });
  if (error) throw error;
}

// Définit un nouveau mot de passe pour la session courante
// (flux invitation ou réinitialisation de mot de passe).
export async function setPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function logout() {
  await supabase.auth.signOut();
}

// ─── COMPANY DATA LOADING ──────────────────────────────

export async function loadPlanningData() {
  const { data, error } = await supabase.rpc('get_planning_data');
  if (error) throw error;
  if (!data) return { companies: [], equipes: [], chantiers: [], conges: [], customFeries: [] };

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
    equipes: (data.equipes || []).map((e) => ({ id: e.id, nom: e.nom, companyId: e.company_id, ordre: e.ordre, color: e.color || '#7dd3fc' })),
    chantiers: dedupedChantiers,
    conges: dedupedConges,
    customFeries: (data.custom_feries || []).map((f) => ({ ...f, companyId: f.company_id })),
    companiesMigrated: data.companies_migrated || {},
  };
}

export async function updateAllColors(chantierColors) {
  const { error } = await supabase
    .rpc('update_all_colors', {
      p_chantier_colors: chantierColors,
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
    color: c.color,
    note: c.note || '',
    termine: !!c.termine,
    linked: !!c.linked,
    detail: c.detail || '',
    force_aout: !!c.force_aout,
    permis: !!c.permis,
    financement: !!c.financement,
    danger: !!c.danger,
    reunion: !!c.reunion,
    facture: !!c.facture,
    montantDevis: Number(c.montantDevis ?? c.montant_devis ?? 0) || 0,
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
      color: c.color || '#b7c6d8',
      note: c.note || '',
      termine: c.termine ? 1 : 0,
      linked: c.linked ? 1 : 0,
      detail: c.detail || '',
      force_aout: c.force_aout ? 1 : 0,
      permis: c.permis ? 1 : 0,
      financement: c.financement ? 1 : 0,
      danger: c.danger ? 1 : 0,
      reunion: c.reunion ? 1 : 0,
      facture: c.facture ? 1 : 0,
      montant_devis: Number(c.montantDevis ?? c.montant_devis ?? 0) || 0,
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
    if (Number.isInteger(c.id) && c.id >= -2147483648 && c.id <= 2147483647) row.id = c.id;
    return row;
  });

  if (rows.length === 0) {
    const { error: delErr } = await supabase
      .from('conges')
      .delete()
      .eq('company_id', companyId);
    if (delErr) { console.error('delete conges error', delErr); throw delErr; }
    return;
  }

  const { error } = await supabase.rpc('replace_conges', {
    p_company_id: companyId,
    p_conges: rows,
  });

  if (error) { console.error('replace_conges error', error); throw error; }
}

export async function upsertEquipes(equipes, companyId) {
  const rows = equipes.map((e, i) => {
    const nom = typeof e === 'string' ? e : e.nom;
    const row = {
      company_id: companyId,
      nom,
      ordre: (typeof e === 'object' && e.ordre != null) ? e.ordre : i + 1,
      color: (typeof e === 'object' && e.color) ? e.color : (i < 5 ? '#7dd3fc' : '#f97316'),
    };
    if (typeof e === 'object' && e.id) row.id = e.id;
    return row;
  });

  if (rows.length === 0) {
    const { error: delErr } = await supabase
      .from('equipes')
      .delete()
      .eq('company_id', companyId);
    if (delErr) { console.error('delete equipes', delErr); throw delErr; }
    return;
  }

  const { data, error } = await supabase.rpc('replace_equipes', {
    p_company_id: companyId,
    p_equipes: rows,
  });

  if (error) { console.error('replace_equipes error', error); throw error; }
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
  if (!error) {
    return (data || []).map((u) => ({
      id: u.id,
      email: u.email,
      nom: u.nom,
      role: u.role,
      email_confirmed_at: u.email_confirmed_at,
      invited: !u.email_confirmed_at,
    }));
  }
  const { data: fb, error: fbErr } = await supabase.from('profiles').select('*');
  if (fbErr) throw fbErr;
  return (fb || []).map((p) => ({
    id: p.id,
    email: p.email,
    nom: p.nom,
    role: p.role,
    email_confirmed_at: p.email_confirmed_at,
    must_change_password: !!p.must_change_password,
    invited: !p.email_confirmed_at,
  }));
}

export async function updateUserProfile(userId, updates) {
  const { error } = await supabase.rpc('update_user_profile', {
    p_user_id: userId,
    p_nom: updates.nom,
    p_role: updates.role,
  });
  if (error) { console.error('update user profile', error); throw error; }
}

export async function saveAllPlanningData(data) {
  const { chantiers, conges, equipes, customFeries, chantierColors } = data;
  const chantierRows = chantiers.map(c => ({
    id: c.id > 0 && c.id <= 2147483647 ? c.id : undefined,
    company_id: c.company_id, equipe: c.equipe, start: c.start, duree: c.duree,
    nom: c.nom, color: c.color || '#b7c6d8',
    note: c.note || '', termine: c.termine ? 1 : 0, linked: c.linked ? 1 : 0,
    detail: c.detail || '', force_aout: c.force_aout ? 1 : 0,
    permis: c.permis ? 1 : 0, financement: c.financement ? 1 : 0,
    danger: c.danger ? 1 : 0, reunion: c.reunion ? 1 : 0, facture: c.facture ? 1 : 0,
    montant_devis: Number(c.montantDevis ?? c.montant_devis ?? 0) || 0,
  }));
  const congeRows = conges.map(c => ({
    id: Number.isInteger(c.id) && c.id >= -2147483648 && c.id <= 2147483647 ? c.id : undefined,
    company_id: c.company_id, equipe: c.equipe, start: c.start, duree: c.duree,
    nom: c.nom || 'Congé', all_equipes: c.allEquipes ? 1 : 0,
  }));
  const equipeRows = equipes.map(e => ({
    id: Number.isInteger(e.id) && e.id !== 0 ? e.id : undefined,
    company_id: e.companyId, nom: e.nom, ordre: e.ordre,
    color: e.color || '#7dd3fc',
  }));
  const ferieRows = customFeries.map(f => ({
    company_id: f.companyId, nom: f.nom, date: f.date,
  }));

  const { data: result, error } = await supabase.rpc('save_all_planning_data', {
    p_chantiers: chantierRows,
    p_conges: congeRows,
    p_equipes: equipeRows,
    p_custom_feries: ferieRows,
    p_chantier_colors: chantierColors,
  });
  if (error) { console.error('save_all_planning_data RPC failed', error.message || error, error.details, error.hint); throw error; }
  return result;
}

export async function createUser(email, password, nom, role, companyIds) {
  const { data, error } = await supabase.rpc('create_user', {
    p_email: email,
    p_password: password,
    p_nom: nom,
    p_role: role,
    p_company_ids: companyIds,
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

// ─── PERSONAL PLANS ────────────────────────────────────────

export async function loadPersonalPlans(userId) {
  const { data, error } = await supabase.rpc('get_personal_plans', { p_user_id: userId });
  if (error) { console.error('loadPersonalPlans', error); throw error; }
  return (data || []).map((plan) => ({
    ...plan,
    rows: (plan.rows || []).map((r) => ({ id: r.id, nom: r.nom, ordre: r.ordre })),
    items: (plan.items || []).map((it) => ({
      id: it.id,
      rowId: it.row_id,
      start: it.start,
      duree: it.duree,
      nom: it.nom,
      color: it.color,
      note: it.note || '',
    })),
  }));
}

export async function createPersonalPlan(userId, nom, startDate) {
  const { data, error } = await supabase
    .from('personal_plans')
    .insert({ user_id: userId, nom, start_date: startDate })
    .select()
    .single();
  if (error) { console.error('createPersonalPlan', error); throw error; }
  return data;
}

export async function deletePersonalPlan(planId) {
  const { error } = await supabase
    .from('personal_plans')
    .delete()
    .eq('id', planId);
  if (error) { console.error('deletePersonalPlan', error); throw error; }
}

export async function renamePersonalPlan(planId, nom) {
  const { error } = await supabase
    .from('personal_plans')
    .update({ nom })
    .eq('id', planId);
  if (error) { console.error('renamePersonalPlan', error); throw error; }
}

export async function savePersonalPlan(planId, rows, items) {
  if (!rows.length && !items.length) return;

  // 1. Delete rows that were removed
  const rowIdsToKeep = rows.filter(r => r.id > 0).map(r => r.id);
  if (rowIdsToKeep.length > 0) {
    await supabase.from('personal_plan_rows')
      .delete()
      .eq('plan_id', planId)
      .not('id', 'in', `(${rowIdsToKeep.join(',')})`);
  } else {
    await supabase.from('personal_plan_rows').delete().eq('plan_id', planId);
  }

  // 2. Insert new rows / update existing rows, capture temp -> real ID mapping
  const tempToReal = new Map();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.id > 0) {
      await supabase.from('personal_plan_rows')
        .update({ nom: r.nom, ordre: i })
        .eq('id', r.id);
    } else {
      const { data, error } = await supabase.from('personal_plan_rows')
        .insert({ plan_id: planId, nom: r.nom, ordre: i })
        .select('id')
        .single();
      if (error) { console.error('savePersonalPlan row insert', error); throw error; }
      if (data) tempToReal.set(r.id, data.id);
    }
  }

  // 3. Delete items that were removed
  const itemIdsToKeep = items.filter(it => it.id > 0).map(it => it.id);
  if (itemIdsToKeep.length > 0) {
    await supabase.from('personal_plan_items')
      .delete()
      .eq('plan_id', planId)
      .not('id', 'in', `(${itemIdsToKeep.join(',')})`);
  } else {
    await supabase.from('personal_plan_items').delete().eq('plan_id', planId);
  }

  // 4. Insert new items / update existing items with resolved row IDs
  for (const it of items) {
    const realRowId = tempToReal.get(it.rowId) || it.rowId;
    if (it.id > 0) {
      await supabase.from('personal_plan_items')
        .update({ row_id: realRowId, start: it.start, duree: it.duree, nom: it.nom || '', color: it.color || '#b7c6d8', note: it.note || '' })
        .eq('id', it.id);
    } else {
      const { error } = await supabase.from('personal_plan_items')
        .insert({ plan_id: planId, row_id: realRowId, start: it.start, duree: it.duree, nom: it.nom || '', color: it.color || '#b7c6d8', note: it.note || '' });
      if (error) { console.error('savePersonalPlan item insert', error); throw error; }
    }
  }
}

// ─── REALTIME BROADCAST ──────────────────────────────────

let planningChannel = null;

export function subscribePlanningUpdates(userId, onNotify) {
  if (planningChannel) {
    supabase.removeChannel(planningChannel);
  }
  planningChannel = supabase.channel('planning-broadcast', {
    config: { broadcast: { self: false } },
  });
  planningChannel.on('broadcast', { event: 'saved' }, () => {
    onNotify();
  });
  planningChannel.subscribe();
  return () => {
    if (planningChannel) {
      supabase.removeChannel(planningChannel);
      planningChannel = null;
    }
  };
}

export function notifyPlanningSaved() {
  if (planningChannel) {
    planningChannel.send({
      type: 'broadcast',
      event: 'saved',
      payload: { timestamp: Date.now() },
    }).catch(() => {});
  }
}

// ─── REALTIME PRESENCE ──────────────────────────────────

let presenceChannel = null;

export function subscribePlanningPresence(userId, nom, companyId, onPresenceUpdate) {
  if (presenceChannel) {
    supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }

  const channelName = companyId
    ? `planning-presence-${companyId}`
    : 'planning-presence';

  presenceChannel = supabase.channel(channelName);

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const seen = new Set();
      const users = [];

      for (const presence of Object.values(state)) {
        for (const p of presence) {
          if (!seen.has(p.userId)) {
            seen.add(p.userId);
            users.push({ userId: p.userId, nom: p.nom });
          }
        }
      }

      onPresenceUpdate(users);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ userId, nom });
      }
    });

  return () => {
    if (presenceChannel) {
      supabase.removeChannel(presenceChannel);
      presenceChannel = null;
    }
  };
}
