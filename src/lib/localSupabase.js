// ─────────────────────────────────────────────────────────────
// Mode local : client Supabase simulé (données dans localStorage)
// Utilisé quand les clés VITE_SUPABASE_* sont absentes (développement
// sans backend). Implémente le sous-ensemble de l'API supabase-js
// utilisé par l'application.
// ─────────────────────────────────────────────────────────────

const STORE_KEY = 'planning_local_store_v4';
const SESSION_KEY = 'planning_local_session_v1';

const TABLE_ALIASES = {
  profiles: 'users',
};

function fmtOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_COLORS = {
  chantier: ['#2563eb', '#93c5fd', '#eab308', '#15803d', '#6b7280', '#f97316', '#7dd3fc'],
};

export const TEAM_COLORS = [
  '#7dd3fc',
  '#38bdf8',
  '#2563eb',
  '#0ea5e9',
  '#22c55e',
  '#84cc16',
  '#ca8a04',
  '#f97316',
  '#ef4444',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

function defaultTeamColor(index) {
  return index < 5 ? '#7dd3fc' : '#f97316';
}

function buildDefaultStore() {
  const equipes = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    company_id: 'batiouest',
    nom: `Équipe ${i + 1}`,
    ordre: i + 1,
    color: defaultTeamColor(i),
  }));

  const chantiers = (() => {
    const list = [];
    let cid = 1;
    const base = fmtOffset(0);
    const toDate = (s) => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const addDays = (s, n=1) => { const d=toDate(s); d.setDate(d.getDate()+n); return fmt(d); };
    const isWeekend = (s) => { const d=toDate(s).getDay(); return d===0||d===6; };
    const isAugust = (s) => { const d=toDate(s); return d.getMonth()===7 && d.getDate()<=21; };
    const nextWorking = (s) => { let cur=s; let saf=0; while((isWeekend(cur)||isAugust(cur))&&saf<600){ cur=addDays(cur,1); saf++; } return cur; };
    const addWorking = (start, n) => {
      let cur = nextWorking(start);
      let cnt = 1;
      let saf=0;
      while(cnt < n && saf<900){
        cur = addDays(cur,1);
        if(!isWeekend(cur)&&!isAugust(cur)) cnt++;
        saf++;
      }
      return cur;
    };
    const addDays1 = (s) => addDays(s,1);
    const colors = ['#2563eb','#93c5fd','#eab308','#15803d','#6b7280','#f97316','#7dd3fc','#f9c7c7','#c7f9c7','#e6c9f9','#c7e6f9','#f9e6c9'];
    const noms = ['Maison individuelle','Extension ossature','Rénovation toiture','Charpente traditionnelle','Garage double','Atelier bois','Hangar agricole','Villa contemporaine','Surélévation','Préau','Appentis','Véranda'];
    const dureesA = [82,84,84];
    const dureesB = [125,125];
    const prixBase = [42000, 58000, 65000, 78000, 52000];
    for(let eq=1; eq<=8; eq++){
      const start0 = nextWorking(base);
      let cur = start0;
      for(let i=0;i<3;i++){
        const duree = dureesA[i] + ((eq+i)%3)*2;
        const end = addWorking(cur, duree);
        const montant = prixBase[i] + eq*1230 + i*2100 + Math.floor(Math.random()*4000) + (duree*120);
        list.push({ id: cid++, company_id:'batiouest', equipe:eq, start:cur, duree, nom:`${noms[(eq+i)%noms.length]} #${eq}.${i+1}`, color: colors[(eq+i)%colors.length], note:'', termine:0, linked:0, detail:`Lot ${i+1} — ${duree}j`, force_aout:0, permis: i===1?1:0, financement:0, danger:0, reunion:0, facture:0, montantDevis: montant });
        cur = nextWorking(addDays1(end));
      }
      cur = start0;
      for(let i=0;i<2;i++){
        const duree = dureesB[i] + ((eq+i)%3);
        const end = addWorking(cur, duree);
        const montant = prixBase[i+3] + eq*1350 + i*1800 + Math.floor(Math.random()*5000) + (duree*110);
        list.push({ id: cid++, company_id:'batiouest', equipe:eq, start:cur, duree, nom:`${noms[(eq+i+5)%noms.length]} #${eq}.${i+4}`, color: colors[(eq+i+3)%colors.length], note:'', termine:0, linked:0, detail:`Lot ${i+4} — ${duree}j`, force_aout:0, permis:0, financement:0, danger:0, reunion:0, facture:0, montantDevis: montant });
        cur = nextWorking(addDays1(end));
      }
    }
    return list;
  })();

  const conges = [
    { id: 1, company_id: 'batiouest', equipe: 1, start: fmtOffset(6), duree: 3, nom: 'Congé', all_equipes: 0 },
    { id: 2, company_id: 'batiouest', equipe: 2, start: fmtOffset(14), duree: 2, nom: 'Congé', all_equipes: 0 },
    { id: 3, company_id: 'batiouest', equipe: 6, start: fmtOffset(9), duree: 4, nom: 'Congé', all_equipes: 0 },
    { id: 4, company_id: 'batiouest', equipe: 7, start: fmtOffset(8), duree: 3, nom: 'Congé', all_equipes: 0 },
    { id: 5, company_id: 'batiouest', equipe: 0, start: fmtOffset(12), duree: 1, nom: 'Fermeture chantier', all_equipes: 1 },
  ];

  const users = [
    { id: 'u-admin', email: 'admin@batiouest.fr', nom: 'Admin Bati Ouest', role: 'admin', password: 'admin123', must_change_password: 0, user_metadata: { role: 'admin', nom: 'Admin Bati Ouest' } },
    { id: 'u-equipe', email: 'equipe@batiouest.fr', nom: 'Charpentier', role: 'planning', password: 'equipe123', must_change_password: 0, user_metadata: { role: 'planning', nom: 'Charpentier' } },
  ];

  return {
    companies: [
      {
        id: 'batiouest',
        nom: 'Bati Ouest',
        secteur: 'Charpente',
        plan: 'Pro',
        free: 1,
        chantier_colors: DEFAULT_COLORS.chantier,
      },
    ],
    equipes,
    chantiers,
    conges,
    custom_feries: [],
    users,
    companies_migrated: { batiouest: true },
    personal_plans: [],
    personal_plan_rows: [],
    personal_plan_items: [],
  };
}

let store = null;

function migrateStore() {
  if (!store) return;
  delete store.conducteurs;
  for (const c of store.companies || []) {
    delete c.conducteur_colors;
  }
  (store.equipes || []).forEach((e, i) => {
    if (!e.color) e.color = defaultTeamColor(i);
  });
  for (const ch of store.chantiers || []) {
    delete ch.conducteurId;
    if (ch.permis === undefined) ch.permis = 0;
    if (ch.financement === undefined) ch.financement = 0;
    if (ch.danger === undefined) ch.danger = 0;
    if (ch.reunion === undefined) ch.reunion = 0;
    if (ch.facture === undefined) ch.facture = 0;
    if (ch.montantDevis === undefined) {
      if (ch.montant_devis !== undefined) ch.montantDevis = ch.montant_devis;
      else ch.montantDevis = 0;
    }
    if (ch.montant_devis !== undefined) delete ch.montant_devis;
  }
}

function loadStore() {
  if (store) return store;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      store = JSON.parse(raw);
      migrateStore();
      persist();
      return store;
    }
  } catch {
    store = null;
  }
  store = buildDefaultStore();
  persist();
  return store;
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('localSupabase: impossible de persister en localStorage', e);
  }
}

function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

function toList(val) {
  return Array.isArray(val) ? val : [val];
}

function sessionUser() {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return store.users.find((u) => u.id === id) || null;
  } catch {
    return null;
  }
}

function makeSession(user) {
  return {
    access_token: `local-${user.id}`,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
    },
  };
}

// ─── Query builder (subset supabase-js) ─────────────────────

class LocalQuery {
  constructor(table, op, payload) {
    this.table = table;
    this.op = op;
    this.payload = payload;
    this.filters = [];
    this.selectCols = null;
    this.returnRows = false;
    this.mode = 'all';
  }

  eq(col, val) { this.filters.push({ type: 'eq', col, val }); return this; }
  neq(col, val) { this.filters.push({ type: 'neq', col, val }); return this; }

  not(col, op, val) {
    if (op === 'in' && typeof val === 'string') {
      const list = val.replace(/^\(|\)$/g, '').split(',').map((s) => s.trim());
      this.filters.push({ type: 'notIn', col, list });
    } else {
      this.filters.push({ type: 'not', col, op, val });
    }
    return this;
  }

  select(cols) {
    if (this.op === 'insert' || this.op === 'update') this.returnRows = true;
    this.selectCols = cols;
    return this;
  }

  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybeSingle'; return this; }

  matches(row) {
    return this.filters.every((f) => {
      const v = row[f.col];
      switch (f.type) {
        case 'eq': return String(v) === String(f.val);
        case 'neq': return String(v) !== String(f.val);
        case 'notIn': return !f.list.includes(String(v));
        case 'not': {
          if (f.op === 'in') return !f.val.includes(String(v));
          return String(v) !== String(f.val);
        }
        default: return true;
      }
    });
  }

  pick(row) {
    if (!this.selectCols) return row;
    const out = {};
    if (this.selectCols === '*') return { ...row };
    const cols = this.selectCols.split(',').map((s) => s.trim());
    for (const c of cols) out[c] = row[c];
    return out;
  }

  async execute() {
    const table = TABLE_ALIASES[this.table] || this.table;
    const t = store[table];
    if (!t || !Array.isArray(t)) {
      return { data: null, error: { message: `Table inconnue : ${this.table}` } };
    }

    if (this.op === 'select') {
      let rows = t.filter((r) => this.matches(r));
      if (this.mode === 'single') {
        return rows.length === 0
          ? { data: null, error: { message: 'Aucune ligne trouvée' } }
          : { data: this.pick(rows[0]), error: null };
      }
      if (this.mode === 'maybeSingle') {
        return { data: rows.length > 0 ? this.pick(rows[0]) : null, error: null };
      }
      return { data: rows.map((r) => this.pick(r)), error: null };
    }

    if (this.op === 'insert') {
      const inserted = toList(this.payload).map((row) => {
        const id = row.id != null && Number(row.id) > 0 ? row.id : nextId(t);
        const newRow = { ...row, id };
        t.push(newRow);
        return newRow;
      });
      persist();
      if (!this.returnRows) return { data: null, error: null };
      if (this.mode === 'single') return { data: this.pick(inserted[0]), error: null };
      return { data: inserted.map((r) => this.pick(r)), error: null };
    }

    if (this.op === 'update') {
      const updated = [];
      for (const row of t) {
        if (this.matches(row)) {
          Object.assign(row, this.payload);
          updated.push(row);
        }
      }
      persist();
      if (!this.returnRows) return { data: null, error: null };
      if (this.mode === 'single') return { data: this.pick(updated[0]), error: null };
      return { data: updated.map((r) => this.pick(r)), error: null };
    }

    if (this.op === 'delete') {
      for (let i = t.length - 1; i >= 0; i--) {
        if (this.matches(t[i])) t.splice(i, 1);
      }
      persist();
      return { data: null, error: null };
    }

    return { data: null, error: { message: 'Opération inconnue' } };
  }

  then(resolve, reject) { return this.execute().then(resolve, reject); }
  catch(reject) { return this.execute().catch(reject); }
  finally(fn) { return this.execute().finally(fn); }
}

// ─── RPC handlers ───────────────────────────────────────────

function replaceById(rows, key) {
  return rows.reduce((acc, r) => { acc[String(r[key])] = r; return acc; }, {});
}

function syncEquipes(p_company_id, p_equipes, keepIds) {
  const companyId = p_company_id || store.companies[0]?.id;
  const byName = replaceById(store.equipes, 'nom');
  const next = p_equipes.map((e, i) => {
    const existing = keepIds && byName[String(e.nom)] && byName[String(e.nom)].company_id === companyId
      ? byName[String(e.nom)]
      : null;
    const row = {
      id: existing ? existing.id : nextId(store.equipes),
      company_id: companyId,
      nom: e.nom,
      ordre: e.ordre != null ? e.ordre : i + 1,
      color: e.color || defaultTeamColor(i),
    };
    if (existing) Object.assign(existing, row);
    else store.equipes.push(row);
    return row;
  });
  store.equipes = store.equipes.filter((e) => e.company_id !== companyId || next.some((r) => r.id === e.id));
  persist();
  return next;
}

function syncChantiers(companyId, rows) {
  store.chantiers = store.chantiers.filter((c) => c.company_id !== companyId);
  const inserted = rows.map((c) => {
    const row = {
      id: c.id && Number(c.id) > 0 ? Number(c.id) : nextId(store.chantiers),
      company_id: companyId,
      equipe: Number(c.equipe) || 0,
      start: c.start,
      duree: Number(c.duree) || 1,
      nom: c.nom || '',
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
      montantDevis: Number(c.montantDevis ?? c.montant_devis ?? 0) || 0,
    };
    store.chantiers.push(row);
    return row;
  });
  persist();
  return inserted;
}

function syncConges(companyId, rows) {
  store.conges = store.conges.filter((c) => c.company_id !== companyId);
  const inserted = rows.map((c) => {
    const row = {
      id: c.id && Number(c.id) > 0 ? Number(c.id) : nextId(store.conges),
      company_id: companyId,
      equipe: Number(c.equipe) || 0,
      start: c.start,
      duree: Number(c.duree) || 1,
      nom: c.nom || 'Congé',
      all_equipes: c.all_equipes ? 1 : 0,
    };
    store.conges.push(row);
    return row;
  });
  persist();
  return inserted;
}

function syncCustomFeries(companyId, rows) {
  store.custom_feries = store.custom_feries.filter((f) => f.company_id !== companyId);
  const inserted = rows.map((f) => {
    const row = { id: nextId(store.custom_feries), company_id: companyId, nom: f.nom, date: f.date };
    store.custom_feries.push(row);
    return row;
  });
  persist();
  return inserted;
}

const rpcHandlers = {
  async get_planning_data() {
    return {
      data: {
        companies: store.companies.map((c) => ({
          id: c.id,
          nom: c.nom,
          chantier_colors: c.chantier_colors || DEFAULT_COLORS.chantier,
        })),
        equipes: store.equipes.map((e) => ({ id: e.id, nom: e.nom, company_id: e.company_id, ordre: e.ordre, color: e.color })),
        chantiers: store.chantiers,
        conges: store.conges,
        custom_feries: store.custom_feries,
        companies_migrated: store.companies_migrated,
      },
      error: null,
    };
  },

  async replace_chantiers({ p_company_id, p_chantiers }) {
    return { data: syncChantiers(p_company_id, toList(p_chantiers)), error: null };
  },

  async replace_conges({ p_company_id, p_conges }) {
    return { data: syncConges(p_company_id, toList(p_conges)), error: null };
  },

  async replace_equipes({ p_company_id, p_equipes }) {
    return { data: syncEquipes(p_company_id, toList(p_equipes), true), error: null };
  },

  async replace_custom_feries({ p_company_id, p_feries }) {
    return { data: syncCustomFeries(p_company_id, toList(p_feries)), error: null };
  },

  async update_all_colors({ p_chantier_colors }) {
    for (const c of store.companies) {
      c.chantier_colors = p_chantier_colors;
    }
    persist();
    return { data: null, error: null };
  },

  async save_all_planning_data(args) {
    const {
      p_chantiers, p_conges, p_equipes,
      p_custom_feries, p_chantier_colors,
    } = args;

    const companyIds = new Set(store.companies.map((c) => c.id));
    for (const compId of companyIds) {
      syncChantiers(compId, toList(p_chantiers).filter((x) => x.company_id === compId));
      syncConges(compId, toList(p_conges).filter((x) => x.company_id === compId));
      syncEquipes(compId, toList(p_equipes).filter((x) => x.company_id === compId), true);
      syncCustomFeries(compId, toList(p_custom_feries).filter((x) => x.company_id === compId));
    }

    for (const c of store.companies) {
      if (p_chantier_colors) c.chantier_colors = p_chantier_colors;
    }

    persist();

    return {
      data: {
        chantiers: store.chantiers,
        conges: store.conges,
        equipes: store.equipes.map((e) => ({ id: e.id, nom: e.nom, company_id: e.company_id, ordre: e.ordre, color: e.color })),
        custom_feries: store.custom_feries,
      },
      error: null,
    };
  },

  async mark_equipes_migrated({ p_company_ids }) {
    for (const id of toList(p_company_ids)) store.companies_migrated[id] = true;
    persist();
    return { data: null, error: null };
  },

  async get_users() {
    return {
      data: store.users.map((u) => ({
        id: u.id,
        email: u.email,
        nom: u.nom,
        role: u.role,
        must_change_password: !!u.must_change_password,
      })),
      error: null,
    };
  },

  async update_user_profile({ p_user_id, p_nom, p_role }) {
    const u = store.users.find((x) => x.id === p_user_id);
    if (u) {
      if (p_nom != null) u.nom = p_nom;
      if (p_role != null) u.role = p_role;
      persist();
    }
    return { data: null, error: null };
  },

  async create_user({ p_email, p_password, p_nom, p_role }) {
    if (store.users.some((u) => u.email === p_email)) {
      return { data: null, error: { message: 'Un utilisateur avec cet email existe déjà.' } };
    }
    const role = p_role || 'planning';
    const user = {
      id: `u-${Date.now()}`,
      email: p_email,
      nom: p_nom || '',
      role,
      password: p_password,
      must_change_password: 0,
      user_metadata: { role, nom: p_nom || '' },
    };
    store.users.push(user);
    persist();
    return {
      data: { id: user.id, email: user.email, nom: user.nom, role: user.role, must_change_password: 0 },
      error: null,
    };
  },

  async delete_user({ p_user_id }) {
    store.users = store.users.filter((u) => u.id !== p_user_id);
    persist();
    return { data: null, error: null };
  },

  async update_password({ p_new_password }) {
    const user = sessionUser();
    if (user) {
      user.password = p_new_password;
      user.must_change_password = 0;
      persist();
    }
    return { data: null, error: null };
  },

  async get_personal_plans({ p_user_id }) {
    const plans = store.personal_plans
      .filter((p) => p.user_id === p_user_id)
      .map((p) => ({
        ...p,
        rows: store.personal_plan_rows.filter((r) => r.plan_id === p.id),
        items: store.personal_plan_items.filter((i) => i.plan_id === p.id),
      }));
    return { data: plans, error: null };
  },
};

// ─── Channels (broadcast / presence simulés) ────────────────

function createChannel(name) {
  const channel = {
    name,
    handlers: { broadcast: [], presence: [] },
    presenceState: () => ({}),
    on(type, opts, cb) {
      (channel.handlers[type] || []).push({ opts, cb });
      return channel;
    },
    subscribe(cb) {
      if (typeof cb === 'function') queueMicrotask(() => cb('SUBSCRIBED'));
      return channel;
    },
    send(payload) {
      return Promise.resolve(payload);
    },
    track() {
      return Promise.resolve();
    },
    untrack() {
      return Promise.resolve();
    },
  };
  return channel;
}

// ─── Client local ───────────────────────────────────────────

export function createLocalSupabase() {
  loadStore();
  const listeners = new Set();

  return {
    auth: {
      async getSession() {
        const user = sessionUser();
        return { data: { session: user ? makeSession(user) : null }, error: null };
      },

      async signInWithPassword({ email, password }) {
        const user = store.users.find(
          (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
        );
        if (!user) {
          return { data: null, error: { message: 'Email ou mot de passe incorrect.' } };
        }
        localStorage.setItem(SESSION_KEY, user.id);
        const session = makeSession(user);
        queueMicrotask(() => listeners.forEach((cb) => cb('SIGNED_IN', session)));
        return { data: { session }, error: null };
      },

      async signOut() {
        localStorage.removeItem(SESSION_KEY);
        queueMicrotask(() => listeners.forEach((cb) => cb('SIGNED_OUT', null)));
        return { error: null };
      },

      async updateUser({ data }) {
        const user = sessionUser();
        if (user) {
          user.user_metadata = { ...user.user_metadata, ...data };
          if (data.nom != null) user.nom = data.nom;
          if (data.role != null) user.role = data.role;
          persist();
        }
        return { data: { user }, error: null };
      },

      onAuthStateChange(cb) {
        listeners.add(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(cb),
            },
          },
        };
      },
    },

    async rpc(name, params) {
      loadStore();
      const handler = rpcHandlers[name];
      if (!handler) {
        return { data: null, error: { message: `RPC inconnue : ${name}` } };
      }
      try {
        return await handler(params || {});
      } catch (e) {
        console.error(`localSupabase RPC ${name}`, e);
        return { data: null, error: { message: e.message || String(e) } };
      }
    },

    from(table) {
      return {
        select(cols) { return new LocalQuery(table, 'select', null).select(cols); },
        insert(rows) { return new LocalQuery(table, 'insert', Array.isArray(rows) ? rows : [rows]); },
        update(payload) { return new LocalQuery(table, 'update', payload); },
        delete() { return new LocalQuery(table, 'delete', null); },
      };
    },

    channel(name) {
      return createChannel(name);
    },

    removeChannel() {},
  };
}
