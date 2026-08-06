import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, corsResponse, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const cors = corsResponse(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return json({ error: 'Méthode non autorisée' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const authHeader = req.headers.get('Authorization') ?? '';

  try {
    const { email, nom, role, companyIds } = await req.json();

    if (!email || !nom || !role) {
      return json({ error: 'email, nom et role sont requis' }, 400);
    }

    // ── Vérifier que l'appelant est un admin authentifié ──
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: caller, error: authErr } = await userClient.auth.getUser();
    if (authErr || !caller?.user) {
      return json({ error: 'Non authentifié' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', caller.user.id)
      .maybeSingle();

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Seuls les admins peuvent inviter' }, 403);
    }

    // ── Créer l'utilisateur auth (invitation native) ──
    // URL de destination du lien : APP_URL si configurée (ex: https://planningnoree.vercel.app),
    // sinon l'Origin de l'appelant (frontend). Ne jamais refléter le host de la fonction.
    const appUrl = Deno.env.get('APP_URL');
    const redirectTo = appUrl ?? req.headers.get('Origin') ?? 'https://planningnoree.vercel.app/';
    const { data: invite, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo,
        data: { role, nom },
      }
    );

    if (inviteErr) {
      const status = /already/i.test(inviteErr.message) ? 409 : 500;
      console.error('invite-user debug inviteErr:', JSON.stringify(inviteErr));
      return json({ error: inviteErr.message, detail: inviteErr }, status);
    }

    const userId = invite?.user?.id;
    if (!userId) {
      return json({ error: 'Création impossible' }, 500);
    }

    // ── Insérer profiles + user_companies (service role, bypass RLS) ──
    // must_change_password = 1 : l'invité doit choisir son mot de passe
    // en cliquant le lien d'invitation (il n'en a pas encore).
    const { error: profileErr } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: email.toLowerCase(),
          nom,
          role,
          must_change_password: 1,
        },
        { onConflict: 'id' }
      );

    if (profileErr) {
      await adminClient.auth.admin.deleteUser(userId);
      return json({ error: 'Échec création du profil' }, 500);
    }

    let companies = Array.isArray(companyIds) ? companyIds : [];
    if (companies.length === 0) {
      const { data: allCompanies } = await adminClient.from('companies').select('id');
      companies = (allCompanies ?? []).map((c) => c.id);
    }

    const companyRows = companies
      .filter((cid) => typeof cid === 'string' && cid)
      .map((cid) => ({ user_id: userId, company_id: cid }));

    if (companyRows.length > 0) {
      const { error: linkErr } = await adminClient
        .from('user_companies')
        .upsert(companyRows, { onConflict: 'user_id,company_id' });
      if (linkErr) {
        await adminClient.auth.admin.deleteUser(userId);
        return json({ error: 'Échec de la liaison entreprise' }, 500);
      }
    }

    return json(
      {
        id: userId,
        email: email.toLowerCase(),
        nom,
        role,
        email_confirmed_at: null,
        must_change_password: 1,
        companyIds: companies,
      },
      201
    );
  } catch (e) {
    console.error('invite-user debug catch:', JSON.stringify(e));
    return json({ error: e?.message ?? 'Erreur inattendue', detail: String(e) }, 500);
  }
});
