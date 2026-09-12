--
-- PostgreSQL database dump
--

\restrict z5DBOAKgAhVOlXCZ6PNVxDxFPRVbJqueRTTB5oZNqJG0Fhph4IqEXgK1GILYQV9

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11 (Ubuntu 17.11-1.pgdg24.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_realtime_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_realtime_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_realtime_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_realtime_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_realtime_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: create_user(text, text, text, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_user(p_email text, p_password text, p_nom text, p_role text, p_company_ids text[]) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
  cid TEXT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les admins peuvent créer des utilisateurs';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    v_user_id := extensions.uuid_generate_v4();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token, is_sso_user, is_anonymous)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', p_email, crypt(p_password, gen_salt('bf')), v_now, v_now, v_now, jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')), jsonb_build_object('role', p_role, 'nom', p_nom), v_now, v_now, '', '', '', '', false, false);
  ELSE
    UPDATE auth.users SET encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = v_now, email_confirmed_at = v_now WHERE id = v_user_id;
  END IF;

  -- supprime puis recrée auth.identities (évite conflit de clé primaire)
  DELETE FROM auth.identities WHERE provider = 'email' AND provider_id = p_email;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id, 'email', p_email),
    'email',
    p_email,
    v_now,
    v_now,
    v_now
  );

  INSERT INTO profiles (id, email, nom, role, must_change_password)
  VALUES (v_user_id, p_email, p_nom, p_role, 1)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, nom = EXCLUDED.nom, role = EXCLUDED.role;

  FOREACH cid IN ARRAY p_company_ids LOOP
    INSERT INTO user_companies (user_id, company_id) VALUES (v_user_id, cid) ON CONFLICT DO NOTHING;
  END LOOP;

  v_result := jsonb_build_object('id', v_user_id, 'email', p_email, 'nom', p_nom, 'role', p_role, 'must_change_password', 1, 'companyIds', to_jsonb(p_company_ids));
  RETURN v_result;
END;
$$;


ALTER FUNCTION public.create_user(p_email text, p_password text, p_nom text, p_role text, p_company_ids text[]) OWNER TO postgres;

--
-- Name: delete_user(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_user(p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Seuls les admins peuvent supprimer des utilisateurs';
  END IF;
  DELETE FROM auth.identities WHERE user_id = p_user_id;
  DELETE FROM user_companies WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;


ALTER FUNCTION public.delete_user(p_user_id uuid) OWNER TO postgres;

--
-- Name: get_personal_plans(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_personal_plans(p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', pp.id,
        'nom', pp.nom,
        'start_date', pp.start_date,
        'created_at', pp.created_at,
        'rows', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object('id', r.id, 'nom', r.nom, 'ordre', r.ordre)
            ORDER BY r.ordre
          ), '[]'::JSONB)
          FROM personal_plan_rows r WHERE r.plan_id = pp.id
        ),
        'items', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object('id', i.id, 'row_id', i.row_id, 'start', i.start, 'duree', i.duree, 'nom', i.nom, 'color', i.color)
          ), '[]'::JSONB)
          FROM personal_plan_items i WHERE i.plan_id = pp.id
        )
      )
      ORDER BY pp.created_at
    ), '[]'::JSONB)
    FROM personal_plans pp
    WHERE pp.user_id = p_user_id
  );
END;
$$;


ALTER FUNCTION public.get_personal_plans(p_user_id uuid) OWNER TO postgres;

--
-- Name: get_planning_data(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_planning_data() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'companies', (
      SELECT jsonb_agg(jsonb_build_object('id', c.id, 'nom', c.nom, 'chantier_colors', COALESCE(c.chantier_colors, ARRAY['#2563eb','#93c5fd','#eab308','#15803d','#6b7280','#f97316','#7dd3fc']::TEXT[]), 'conducteur_colors', COALESCE(c.conducteur_colors, ARRAY['#2563eb','#16a34a','#dc2626','#9333ea','#ea580c','#0891b2','#ca8a04','#be123c']::TEXT[])))
      FROM (
        SELECT id, nom, chantier_colors, conducteur_colors FROM companies WHERE id = 'noree'
        UNION ALL
        SELECT id, nom, chantier_colors, conducteur_colors FROM companies WHERE id = 'couvran'
        UNION ALL
        SELECT id, nom, chantier_colors, conducteur_colors FROM companies WHERE id = 'rat'
      ) c
    ),
    'equipes', (
      SELECT jsonb_agg(jsonb_build_object('id', e.id, 'nom', e.nom, 'company_id', e.company_id, 'ordre', e.ordre))
      FROM (
        SELECT id, nom, company_id, ordre
        FROM equipes
        ORDER BY
          CASE company_id
            WHEN 'noree' THEN 1
            WHEN 'couvran' THEN 2
            WHEN 'rat' THEN 3
            ELSE 4
          END, ordre
      ) e
    ),
    'chantiers', (SELECT jsonb_agg(to_jsonb(ch)) FROM chantiers ch),
    'conges', (SELECT jsonb_agg(to_jsonb(co)) FROM conges co),
    'conducteurs', (SELECT jsonb_agg(jsonb_build_object('id', cd.id, 'nom', cd.nom, 'color', cd.color)) FROM conducteurs cd),
    'custom_feries', (SELECT jsonb_agg(to_jsonb(cf)) FROM custom_feries cf),
    'companies_migrated', (
      SELECT jsonb_object_agg(id, COALESCE(equipe_id_migrated, false))
      FROM companies
    )
  ) INTO result;
  RETURN result;
END;
$$;


ALTER FUNCTION public.get_planning_data() OWNER TO postgres;

--
-- Name: get_users(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_users() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN '[]'::JSONB;
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',                p.id,
        'email',             p.email,
        'nom',               p.nom,
        'role',              p.role,
        'email_confirmed_at', u.email_confirmed_at
      )
    )
    FROM profiles p
    LEFT JOIN auth.users u ON u.id = p.id
  ), '[]'::JSONB);
END;
$$;


ALTER FUNCTION public.get_users() OWNER TO postgres;

--
-- Name: mark_equipes_migrated(text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mark_equipes_migrated(p_company_ids text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE companies SET equipe_id_migrated = true WHERE id = ANY(p_company_ids);
END;
$$;


ALTER FUNCTION public.mark_equipes_migrated(p_company_ids text[]) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chantiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chantiers (
    id integer NOT NULL,
    company_id text NOT NULL,
    equipe integer DEFAULT 0 NOT NULL,
    start text NOT NULL,
    duree integer DEFAULT 1 NOT NULL,
    nom text NOT NULL,
    "conducteurId" integer DEFAULT 0,
    color text DEFAULT '#b7c6d8'::text,
    note text DEFAULT ''::text,
    termine integer DEFAULT 0,
    linked integer DEFAULT 0,
    detail text DEFAULT ''::text,
    force_aout boolean DEFAULT false,
    montant_devis integer DEFAULT 0,
    client_nom text DEFAULT ''::text,
    client_adresse text DEFAULT ''::text,
    client_telephone text DEFAULT ''::text,
    numero_chantier text DEFAULT ''::text,
    "vendeurId" integer DEFAULT 0,
    "typeChantierId" integer DEFAULT 0
);


ALTER TABLE public.chantiers OWNER TO postgres;

--
-- Name: replace_chantiers(text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.replace_chantiers(p_company_id text, p_chantiers jsonb) RETURNS SETOF public.chantiers
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  -- Delete rows that exist in DB but NOT in the incoming array
  DELETE FROM chantiers
  WHERE company_id = p_company_id
  AND id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_chantiers) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  -- Upsert all incoming rows (non-destructive)
  RETURN QUERY
  INSERT INTO chantiers (id, company_id, equipe, start, duree, nom, color, note, termine, linked, detail, force_aout, permis, financement, danger, reunion, facture, montant_devis)
  SELECT COALESCE((x->>'id')::INT, nextval('chantiers_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT, (x->>'start')::TEXT, (x->>'duree')::INT,
         (x->>'nom')::TEXT, (x->>'color')::TEXT, (x->>'note')::TEXT,
         (x->>'termine')::INT, (x->>'linked')::INT, (x->>'detail')::TEXT, COALESCE((x->>'force_aout')::INT, 0),
         COALESCE((x->>'permis')::INT, 0), COALESCE((x->>'financement')::INT, 0),
         COALESCE((x->>'danger')::INT, 0), COALESCE((x->>'reunion')::INT, 0), COALESCE((x->>'facture')::INT, 0),
         COALESCE((x->>'montant_devis')::INT, 0)
  FROM jsonb_array_elements(p_chantiers) AS x
  ON CONFLICT (id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    equipe = EXCLUDED.equipe,
    start = EXCLUDED.start,
    duree = EXCLUDED.duree,
    nom = EXCLUDED.nom,
    color = EXCLUDED.color,
    note = EXCLUDED.note,
    termine = EXCLUDED.termine,
    linked = EXCLUDED.linked,
    detail = EXCLUDED.detail,
    force_aout = EXCLUDED.force_aout,
    permis = EXCLUDED.permis,
    financement = EXCLUDED.financement,
    danger = EXCLUDED.danger,
    reunion = EXCLUDED.reunion,
    facture = EXCLUDED.facture,
    montant_devis = EXCLUDED.montant_devis
  RETURNING *;
END;
$_$;


ALTER FUNCTION public.replace_chantiers(p_company_id text, p_chantiers jsonb) OWNER TO postgres;

--
-- Name: conducteurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conducteurs (
    id integer NOT NULL,
    nom text NOT NULL,
    color text DEFAULT '#2563eb'::text NOT NULL
);


ALTER TABLE public.conducteurs OWNER TO postgres;

--
-- Name: replace_conducteurs(text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.replace_conducteurs(p_company_id text, p_conducteurs jsonb) RETURNS SETOF public.conducteurs
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
    BEGIN
      IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = $tg$lecture$tg$) THEN
        RAISE EXCEPTION $tg$Acces refuse : role lecture$tg$;
      END IF;
      DELETE FROM conducteurs WHERE company_id = p_company_id;
      RETURN QUERY
      INSERT INTO conducteurs (company_id, nom, color)
      SELECT (x->>$tg$company_id$tg$)::TEXT, (x->>$tg$nom$tg$)::TEXT, (x->>$tg$color$tg$)::TEXT
      FROM jsonb_array_elements(p_conducteurs) AS x
      RETURNING *;
    END;
    $_$;


ALTER FUNCTION public.replace_conducteurs(p_company_id text, p_conducteurs jsonb) OWNER TO postgres;

--
-- Name: conges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conges (
    company_id text NOT NULL,
    equipe integer DEFAULT 0 NOT NULL,
    start text NOT NULL,
    duree integer DEFAULT 1 NOT NULL,
    nom text DEFAULT 'Congé'::text,
    id integer NOT NULL,
    all_equipes integer DEFAULT 0
);


ALTER TABLE public.conges OWNER TO postgres;

--
-- Name: replace_conges(text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.replace_conges(p_company_id text, p_conges jsonb) RETURNS SETOF public.conges
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  -- Supprime les congés qui ne sont plus dans la liste entrante
  DELETE FROM conges
  WHERE company_id = p_company_id
  AND id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conges) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  RETURN QUERY
  INSERT INTO conges (id, company_id, equipe, start, duree, nom, all_equipes)
  SELECT COALESCE((x->>'id')::INT, nextval('conges_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
         (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT,
         COALESCE((x->>'all_equipes')::INT, 0)
  FROM jsonb_array_elements(p_conges) AS x
  ON CONFLICT (id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    equipe = EXCLUDED.equipe,
    start = EXCLUDED.start,
    duree = EXCLUDED.duree,
    nom = EXCLUDED.nom,
    all_equipes = EXCLUDED.all_equipes
  RETURNING *;
END;
$_$;


ALTER FUNCTION public.replace_conges(p_company_id text, p_conges jsonb) OWNER TO postgres;

--
-- Name: custom_feries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_feries (
    id integer NOT NULL,
    company_id text NOT NULL,
    nom text NOT NULL,
    date text NOT NULL
);


ALTER TABLE public.custom_feries OWNER TO postgres;

--
-- Name: replace_custom_feries(text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.replace_custom_feries(p_company_id text, p_feries jsonb) RETURNS SETOF public.custom_feries
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  DELETE FROM custom_feries WHERE company_id = p_company_id;
  RETURN QUERY
  INSERT INTO custom_feries (company_id, nom, date)
  SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'date')::TEXT
  FROM jsonb_array_elements(p_feries) AS x
  RETURNING *;
END;
$$;


ALTER FUNCTION public.replace_custom_feries(p_company_id text, p_feries jsonb) OWNER TO postgres;

--
-- Name: equipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipes (
    id integer NOT NULL,
    company_id text NOT NULL,
    nom text NOT NULL,
    ordre integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.equipes OWNER TO postgres;

--
-- Name: replace_equipes(text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.replace_equipes(p_company_id text, p_equipes jsonb) RETURNS SETOF public.equipes
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  DELETE FROM equipes WHERE company_id = p_company_id;
  RETURN QUERY
  INSERT INTO equipes (company_id, nom, ordre)
  SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'ordre')::INT
  FROM jsonb_array_elements(p_equipes) AS x RETURNING *;
END;
$$;


ALTER FUNCTION public.replace_equipes(p_company_id text, p_equipes jsonb) OWNER TO postgres;

--
-- Name: save_all_planning_data(jsonb, jsonb, jsonb, jsonb, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_custom_feries jsonb, p_chantier_colors text[]) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
  comp_id TEXT;
  result JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;

  FOR comp_id IN SELECT id FROM companies LOOP
    -- Chantiers
    DELETE FROM chantiers
    WHERE company_id = comp_id
    AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_chantiers) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
      AND (x->>'company_id') = comp_id
    );
    INSERT INTO chantiers (id, company_id, equipe, start, duree, nom, color, note, termine, linked, detail, force_aout, permis, financement, danger, reunion, facture, montant_devis)
    SELECT COALESCE((x->>'id')::INT, nextval('chantiers_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT, (x->>'start')::TEXT, (x->>'duree')::INT,
           (x->>'nom')::TEXT, (x->>'color')::TEXT, (x->>'note')::TEXT,
           (x->>'termine')::INT, (x->>'linked')::INT, (x->>'detail')::TEXT, COALESCE((x->>'force_aout')::INT, 0),
           COALESCE((x->>'permis')::INT, 0), COALESCE((x->>'financement')::INT, 0),
           COALESCE((x->>'danger')::INT, 0), COALESCE((x->>'reunion')::INT, 0), COALESCE((x->>'facture')::INT, 0),
           COALESCE((x->>'montant_devis')::INT, 0)
    FROM jsonb_array_elements(p_chantiers) AS x
    WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET
      company_id = EXCLUDED.company_id, equipe = EXCLUDED.equipe, start = EXCLUDED.start,
      duree = EXCLUDED.duree, nom = EXCLUDED.nom, color = EXCLUDED.color, note = EXCLUDED.note,
      termine = EXCLUDED.termine, linked = EXCLUDED.linked, detail = EXCLUDED.detail,
      force_aout = EXCLUDED.force_aout, permis = EXCLUDED.permis, financement = EXCLUDED.financement,
      danger = EXCLUDED.danger, reunion = EXCLUDED.reunion, facture = EXCLUDED.facture, montant_devis = EXCLUDED.montant_devis;

    -- Conges
    DELETE FROM conges
    WHERE company_id = comp_id
    AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conges) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
      AND (x->>'company_id') = comp_id
    );
    INSERT INTO conges (id, company_id, equipe, start, duree, nom, all_equipes)
    SELECT COALESCE((x->>'id')::INT, nextval('conges_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, COALESCE((x->>'all_equipes')::INT, 0)
    FROM jsonb_array_elements(p_conges) AS x
    WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET
      company_id = EXCLUDED.company_id, equipe = EXCLUDED.equipe, start = EXCLUDED.start,
      duree = EXCLUDED.duree, nom = EXCLUDED.nom, all_equipes = EXCLUDED.all_equipes;

    -- Equipes
    DELETE FROM equipes WHERE company_id = comp_id;
    INSERT INTO equipes (company_id, nom, ordre, color)
    SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, COALESCE((x->>'ordre')::INT, 1), COALESCE((x->>'color'), '#7dd3fc')
    FROM jsonb_array_elements(p_equipes) AS x
    WHERE (x->>'company_id') = comp_id;

    -- Custom feries
    DELETE FROM custom_feries WHERE company_id = comp_id;
    INSERT INTO custom_feries (company_id, nom, date)
    SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'date')::TEXT
    FROM jsonb_array_elements(p_custom_feries) AS x
    WHERE (x->>'company_id') = comp_id;

    -- Couleurs
    UPDATE companies SET chantier_colors = p_chantier_colors WHERE id = comp_id;
  END LOOP;

  SELECT jsonb_build_object(
    'chantiers', (SELECT jsonb_agg(to_jsonb(ch) ORDER BY ch.id) FROM chantiers ch),
    'conges', (SELECT jsonb_agg(to_jsonb(co) ORDER BY co.id) FROM conges co),
    'equipes', (SELECT jsonb_agg(jsonb_build_object('nom', e.nom, 'company_id', e.company_id, 'ordre', e.ordre, 'color', COALESCE(e.color, '#7dd3fc')) ORDER BY e.ordre) FROM equipes e),
    'custom_feries', (SELECT jsonb_agg(to_jsonb(cf) ORDER BY cf.id) FROM custom_feries cf)
  ) INTO result;
  RETURN result;
END;
$_$;


ALTER FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_custom_feries jsonb, p_chantier_colors text[]) OWNER TO postgres;

--
-- Name: save_all_planning_data(jsonb, jsonb, jsonb, jsonb, jsonb, text[], text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_conducteurs jsonb, p_custom_feries jsonb, p_chantier_colors text[], p_conducteur_colors text[]) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
  comp_id TEXT; result JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  FOR comp_id IN SELECT id FROM companies LOOP
    DELETE FROM chantiers WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_chantiers) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
    );
    INSERT INTO chantiers (id, company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail, force_aout)
    SELECT COALESCE((x->>'id')::INT, nextval('chantiers_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, (x->>'conducteurId')::INT, (x->>'color')::TEXT,
           (x->>'note')::TEXT, (x->>'termine')::INT, (x->>'linked')::INT, (x->>'detail')::TEXT, COALESCE((x->>'force_aout')::INT,0)::BOOLEAN
    FROM jsonb_array_elements(p_chantiers) AS x WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, equipe=EXCLUDED.equipe, start=EXCLUDED.start,
      duree=EXCLUDED.duree, nom=EXCLUDED.nom, "conducteurId"=EXCLUDED."conducteurId", color=EXCLUDED.color,
      note=EXCLUDED.note, termine=EXCLUDED.termine, linked=EXCLUDED.linked, detail=EXCLUDED.detail, force_aout=EXCLUDED.force_aout;

    DELETE FROM conges WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conges) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
    );
    INSERT INTO conges (id, company_id, equipe, start, duree, nom, all_equipes)
    SELECT COALESCE((x->>'id')::INT, nextval('conges_id_seq'::regclass)), (x->>'company_id')::TEXT, (x->>'equipe')::INT,
           (x->>'start')::TEXT, (x->>'duree')::INT, (x->>'nom')::TEXT, COALESCE((x->>'all_equipes')::INT,0)
    FROM jsonb_array_elements(p_conges) AS x WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, equipe=EXCLUDED.equipe, start=EXCLUDED.start,
      duree=EXCLUDED.duree, nom=EXCLUDED.nom, all_equipes=EXCLUDED.all_equipes;

    INSERT INTO equipes (id, company_id, nom, ordre)
    SELECT COALESCE(NULLIF((x->>'id')::INT,0), NULLIF((x->>'id')::INT,-2147483648), nextval('equipes_id_seq'::regclass)),
      (x->>'company_id')::TEXT, (x->>'nom')::TEXT, COALESCE((x->>'ordre')::INT,1)
    FROM jsonb_array_elements(p_equipes) AS x WHERE (x->>'company_id') = comp_id
    ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, nom=EXCLUDED.nom, ordre=EXCLUDED.ordre;

    DELETE FROM equipes WHERE company_id = comp_id AND id NOT IN (
      SELECT (x->>'id')::INT FROM jsonb_array_elements(p_equipes) AS x
      WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$' AND (x->>'company_id') = comp_id
      AND NULLIF((x->>'id')::INT,0) IS NOT NULL AND NULLIF((x->>'id')::INT,-2147483648) IS NOT NULL
    );

    DELETE FROM custom_feries WHERE company_id = comp_id;
    INSERT INTO custom_feries (company_id, nom, date)
    SELECT (x->>'company_id')::TEXT, (x->>'nom')::TEXT, (x->>'date')::TEXT
    FROM jsonb_array_elements(p_custom_feries) AS x WHERE (x->>'company_id') = comp_id;
  END LOOP;

  DELETE FROM conducteurs WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO conducteurs (nom, color) SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_conducteurs) AS r ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  UPDATE companies SET chantier_colors = p_chantier_colors, conducteur_colors = p_conducteur_colors
  WHERE id IN (SELECT id FROM companies);

  DELETE FROM conducteurs WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  INSERT INTO conducteurs (nom, color) SELECT r->>'nom', r->>'color'
  FROM jsonb_array_elements(p_conducteurs) AS r ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;

  SELECT jsonb_build_object('chantiers',(SELECT jsonb_agg(to_jsonb(ch) ORDER BY ch.id) FROM chantiers ch),
    'conges',(SELECT jsonb_agg(to_jsonb(co) ORDER BY co.id) FROM conges co),
    'equipes',(SELECT jsonb_agg(jsonb_build_object('id',e.id,'nom',e.nom,'company_id',e.company_id,'ordre',e.ordre) ORDER BY e.ordre) FROM equipes e),
    'conducteurs',(SELECT jsonb_agg(jsonb_build_object('id',cd.id,'nom',cd.nom,'color',cd.color) ORDER BY cd.id) FROM conducteurs cd),
    'custom_feries',(SELECT jsonb_agg(to_jsonb(cf) ORDER BY cf.id) FROM custom_feries cf)) INTO result;
  RETURN result;
END;
$_$;


ALTER FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_conducteurs jsonb, p_custom_feries jsonb, p_chantier_colors text[], p_conducteur_colors text[]) OWNER TO postgres;

--
-- Name: save_personal_plan(integer, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_personal_plan(p_plan_id integer, p_rows jsonb, p_items jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM personal_plans WHERE id = p_plan_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acces refuse : ce planning ne vous appartient pas';
  END IF;

  DELETE FROM personal_plan_rows
  WHERE plan_id = p_plan_id
  AND id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_rows) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );

  INSERT INTO personal_plan_rows (id, plan_id, nom, ordre)
  SELECT
    COALESCE((x->>'id')::INT, nextval('personal_plan_rows_id_seq'::regclass)),
    p_plan_id,
    (x->>'nom')::TEXT,
    (x->>'ordre')::INT
  FROM jsonb_array_elements(p_rows) AS x
  ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    ordre = EXCLUDED.ordre;

  DELETE FROM personal_plan_items
  WHERE plan_id = p_plan_id
  AND id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_items) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );

  INSERT INTO personal_plan_items (id, plan_id, row_id, start, duree, nom, color)
  SELECT
    COALESCE((x->>'id')::INT, nextval('personal_plan_items_id_seq'::regclass)),
    p_plan_id,
    (x->>'row_id')::INT,
    (x->>'start')::TEXT,
    (x->>'duree')::INT,
    (x->>'nom')::TEXT,
    (x->>'color')::TEXT
  FROM jsonb_array_elements(p_items) AS x
  ON CONFLICT (id) DO UPDATE SET
    row_id = EXCLUDED.row_id,
    start = EXCLUDED.start,
    duree = EXCLUDED.duree,
    nom = EXCLUDED.nom,
    color = EXCLUDED.color;
END;
$_$;


ALTER FUNCTION public.save_personal_plan(p_plan_id integer, p_rows jsonb, p_items jsonb) OWNER TO postgres;

--
-- Name: test_regex_func2(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.test_regex_func2() RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
    BEGIN
      RETURN $$6307$$ ~ $$^\\d+$$;
    END;
    $_$;


ALTER FUNCTION public.test_regex_func2() OWNER TO postgres;

--
-- Name: update_all_colors(text[], text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_all_colors(p_chantier_colors text[], p_conducteur_colors text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  UPDATE companies
  SET chantier_colors = p_chantier_colors, conducteur_colors = p_conducteur_colors;
END;
$$;


ALTER FUNCTION public.update_all_colors(p_chantier_colors text[], p_conducteur_colors text[]) OWNER TO postgres;

--
-- Name: update_company_colors(text, text[], text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_company_colors(p_company_id text, p_chantier_colors text[], p_conducteur_colors text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  UPDATE companies SET chantier_colors = p_chantier_colors, conducteur_colors = p_conducteur_colors WHERE id = p_company_id;
END;
$$;


ALTER FUNCTION public.update_company_colors(p_company_id text, p_chantier_colors text[], p_conducteur_colors text[]) OWNER TO postgres;

--
-- Name: update_password(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_password(p_new_password text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = NOW() WHERE id = auth.uid();
  UPDATE profiles SET must_change_password = 0 WHERE id = auth.uid();
END;
$$;


ALTER FUNCTION public.update_password(p_new_password text) OWNER TO postgres;

--
-- Name: update_user_profile(uuid, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_profile(p_user_id uuid, p_nom text, p_role text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  UPDATE profiles SET nom = p_nom, role = p_role WHERE id = p_user_id;
END;
$$;


ALTER FUNCTION public.update_user_profile(p_user_id uuid, p_nom text, p_role text) OWNER TO postgres;

--
-- Name: upsert_conducteurs(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.upsert_conducteurs(p_conducteurs jsonb) RETURNS SETOF public.conducteurs
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
  r JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  DELETE FROM conducteurs
  WHERE id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  FOR r IN SELECT * FROM jsonb_array_elements(p_conducteurs) LOOP
    INSERT INTO conducteurs (nom, color)
    VALUES (r->>'nom', r->>'color')
    ON CONFLICT (nom) DO UPDATE SET color = EXCLUDED.color;
  END LOOP;
  RETURN QUERY SELECT * FROM conducteurs ORDER BY id;
END;
$_$;


ALTER FUNCTION public.upsert_conducteurs(p_conducteurs jsonb) OWNER TO postgres;

--
-- Name: upsert_conducteurs(text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.upsert_conducteurs(p_company_id text, p_conducteurs jsonb) RETURNS SETOF public.conducteurs
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
  r JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lecture') THEN
    RAISE EXCEPTION 'Accès refusé : rôle lecture';
  END IF;
  -- Supprime les conducteurs qui ne sont plus dans la liste entrante
  DELETE FROM conducteurs
  WHERE company_id = p_company_id
  AND id NOT IN (
    SELECT (x->>'id')::INT FROM jsonb_array_elements(p_conducteurs) AS x
    WHERE (x->>'id') IS NOT NULL AND (x->>'id') ~ '^-?[0-9]+$'
  );
  FOR r IN SELECT * FROM jsonb_array_elements(p_conducteurs) LOOP
    INSERT INTO conducteurs (company_id, nom, color)
    VALUES (p_company_id, r->>'nom', r->>'color')
    ON CONFLICT (company_id, nom) DO UPDATE SET color = EXCLUDED.color;
  END LOOP;
  RETURN QUERY SELECT * FROM conducteurs WHERE company_id = p_company_id ORDER BY id;
END;
$_$;


ALTER FUNCTION public.upsert_conducteurs(p_company_id text, p_conducteurs jsonb) OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_realtime_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_realtime_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_realtime_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_realtime_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_realtime_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_realtime_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_realtime_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_realtime_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_prefix_len INT;
    v_prefix_start INT;
    v_combined_levels INT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_prefix_len := length(coalesce(prefix, ''));
    v_prefix_start := coalesce(array_length(string_to_array(coalesce(prefix, ''), v_delimiter), 1), 1);
    v_combined_levels := coalesce(array_length(string_to_array(v_prefix, v_delimiter), 1), 1);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT array_to_string(path_tokens[$1:$2], '/') AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $3 || '%%'
                  AND bucket_id = $4
                  AND array_length(objects.path_tokens, 1) <> $2
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT array_to_string(path_tokens[$1:$2], '/') AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $3 || '%%'
               AND bucket_id = $4
               AND array_length(objects.path_tokens, 1) = $2
             ORDER BY %I %s)
            LIMIT $5 OFFSET $6
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING v_prefix_start, v_combined_levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := substring(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter) from v_prefix_len + 1);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := substring(v_current.name from v_prefix_len + 1);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
    v_sort_order text;
    v_sort_column text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    -- Defense-in-depth: this function is independently reachable and must
    -- not trust p_sort_order/p_sort_column to already be validated by a
    -- caller. Normalize to the same strict allow-list storage.search_v2
    -- uses before interpolating anything into dynamic SQL below.
    v_sort_order := lower(coalesce(p_sort_order, 'asc'));
    IF v_sort_order NOT IN ('asc', 'desc') THEN
        v_sort_order := 'asc';
    END IF;

    v_sort_column := lower(coalesce(p_sort_column, 'updated_at'));
    IF v_sort_column NOT IN ('updated_at', 'created_at') THEN
        v_sort_column := 'updated_at';
    END IF;

    IF v_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        v_sort_column,
        v_cursor_op,
        v_sort_column,
        v_sort_order,
        v_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: chantiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.chantiers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.chantiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id text NOT NULL,
    nom text NOT NULL,
    secteur text DEFAULT ''::text,
    plan text DEFAULT 'Starter'::text,
    free integer DEFAULT 1,
    chantier_colors text[],
    conducteur_colors text[],
    equipe_id_migrated boolean DEFAULT false
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: conducteurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.conducteurs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.conducteurs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.conges ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.conges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: custom_feries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.custom_feries ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.custom_feries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: equipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.equipes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: personal_plan_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_plan_items (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    row_id integer NOT NULL,
    start text NOT NULL,
    duree integer DEFAULT 1 NOT NULL,
    nom text DEFAULT ''::text NOT NULL,
    color text DEFAULT '#b7c6d8'::text,
    note text DEFAULT ''::text
);


ALTER TABLE public.personal_plan_items OWNER TO postgres;

--
-- Name: personal_plan_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.personal_plan_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.personal_plan_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: personal_plan_rows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_plan_rows (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    nom text DEFAULT 'Nouvelle tache'::text NOT NULL,
    ordre integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.personal_plan_rows OWNER TO postgres;

--
-- Name: personal_plan_rows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.personal_plan_rows ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.personal_plan_rows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: personal_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_plans (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    nom text DEFAULT 'Nouveau planning'::text NOT NULL,
    start_date text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.personal_plans OWNER TO postgres;

--
-- Name: personal_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.personal_plans ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.personal_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    nom text DEFAULT ''::text NOT NULL,
    role text DEFAULT 'planning'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    must_change_password integer DEFAULT 0
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: types_chantier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.types_chantier (
    id integer NOT NULL,
    nom text NOT NULL,
    color text DEFAULT '#2563eb'::text NOT NULL
);


ALTER TABLE public.types_chantier OWNER TO postgres;

--
-- Name: types_chantier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.types_chantier ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.types_chantier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_companies (
    user_id uuid NOT NULL,
    company_id text NOT NULL
);


ALTER TABLE public.user_companies OWNER TO postgres;

--
-- Name: vendeurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendeurs (
    id integer NOT NULL,
    nom text NOT NULL,
    color text DEFAULT '#2563eb'::text NOT NULL
);


ALTER TABLE public.vendeurs OWNER TO postgres;

--
-- Name: vendeurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.vendeurs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.vendeurs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_09_08; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_08 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_08 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_09_09; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_09 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_09 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_09_10; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_10 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_10 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_09_11; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_11 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_11 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_09_12; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_12 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_12 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_09_13; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_13 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_13 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_09_14; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_14 OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_realtime_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
    versioning_status text DEFAULT 'DISABLED'::text NOT NULL,
    CONSTRAINT buckets_versioning_dark_check CHECK ((versioning_status = 'DISABLED'::text)),
    CONSTRAINT buckets_versioning_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR (versioning_status = 'DISABLED'::text))),
    CONSTRAINT buckets_versioning_status_check CHECK ((versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text])))
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    archived_at timestamp with time zone,
    is_delete_marker boolean DEFAULT false NOT NULL,
    is_versioned boolean DEFAULT false NOT NULL
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: messages_2026_09_08; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_08 FOR VALUES FROM ('2026-09-08 00:00:00') TO ('2026-09-09 00:00:00');


--
-- Name: messages_2026_09_09; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_09 FOR VALUES FROM ('2026-09-09 00:00:00') TO ('2026-09-10 00:00:00');


--
-- Name: messages_2026_09_10; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_10 FOR VALUES FROM ('2026-09-10 00:00:00') TO ('2026-09-11 00:00:00');


--
-- Name: messages_2026_09_11; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_11 FOR VALUES FROM ('2026-09-11 00:00:00') TO ('2026-09-12 00:00:00');


--
-- Name: messages_2026_09_12; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_12 FOR VALUES FROM ('2026-09-12 00:00:00') TO ('2026-09-13 00:00:00');


--
-- Name: messages_2026_09_13; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_13 FOR VALUES FROM ('2026-09-13 00:00:00') TO ('2026-09-14 00:00:00');


--
-- Name: messages_2026_09_14; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_14 FOR VALUES FROM ('2026-09-14 00:00:00') TO ('2026-09-15 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
a8602130-044c-4c55-b726-9f4adaeb8f00	a8602130-044c-4c55-b726-9f4adaeb8f00	{"sub": "a8602130-044c-4c55-b726-9f4adaeb8f00", "email": "admin@couvran.com", "email_verified": true, "phone_verified": false}	email	2026-09-01 11:58:07.496927+00	2026-09-01 11:58:07.496985+00	2026-09-01 11:58:07.496985+00	8b0b7516-9810-459d-b5bd-b315f9db1c8e
9f85d70f-f03b-4b59-a65a-a333889c66f7	9f85d70f-f03b-4b59-a65a-a333889c66f7	{"sub": "9f85d70f-f03b-4b59-a65a-a333889c66f7", "email": "contact@couvran.com", "email_verified": true, "phone_verified": false}	email	2026-09-01 12:22:23.439971+00	2026-09-01 12:22:23.440015+00	2026-09-01 12:22:23.440015+00	df7edc3d-bc53-4cca-997a-bb6c0cb01f9d
7bdbaabe-619a-43d1-bac5-27643379bfa7	7bdbaabe-619a-43d1-bac5-27643379bfa7	{"sub": "7bdbaabe-619a-43d1-bac5-27643379bfa7", "email": "tcorlay03@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-09-09 12:58:29.321795+00	2026-09-09 12:58:29.321836+00	2026-09-09 12:58:29.321836+00	95163918-1615-4dd1-bc2a-6bd32f9455dc
t.corlay@noree.fr	0168f0de-46a5-4912-bad1-d4b3205f6384	{"sub": "0168f0de-46a5-4912-bad1-d4b3205f6384", "email": "t.corlay@noree.fr"}	email	2026-07-23 14:03:09.219251+00	2026-07-23 14:03:09.219251+00	2026-07-23 14:03:09.219251+00	0168f0de-46a5-4912-bad1-d4b3205f6384
devis@noree.fr	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	{"sub": "4b28001a-bb0c-416a-9e59-d2f39d65f2fe", "email": "devis@noree.fr"}	email	2026-07-24 08:47:59.472615+00	2026-07-24 08:47:59.472615+00	2026-07-24 08:47:59.472615+00	4b28001a-bb0c-416a-9e59-d2f39d65f2fe
s.poirier@noree.fr	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	{"sub": "9faaa3f0-688e-4fab-afa9-b6fc9e59f27f", "email": "s.poirier@noree.fr"}	email	2026-07-24 08:49:44.03091+00	2026-07-24 08:49:44.03091+00	2026-07-24 08:49:44.03091+00	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f
r.leherisse@noree.fr	2407b7ed-f057-4b44-842f-7026dce4f5eb	{"sub": "2407b7ed-f057-4b44-842f-7026dce4f5eb", "email": "r.leherisse@noree.fr"}	email	2026-07-24 08:52:30.176933+00	2026-07-24 08:52:30.176933+00	2026-07-24 08:52:30.176933+00	2407b7ed-f057-4b44-842f-7026dce4f5eb
batiment@noree.fr	c4aa0201-db24-4468-b0f6-f5fc6df0d095	{"sub": "c4aa0201-db24-4468-b0f6-f5fc6df0d095", "email": "batiment@noree.fr"}	email	2026-07-24 09:00:24.211763+00	2026-07-24 09:00:24.211763+00	2026-07-24 09:00:24.211763+00	c4aa0201-db24-4468-b0f6-f5fc6df0d095
j.courtel@noree.fr	7caffb15-3aa0-4304-a043-6b992628741c	{"sub": "7caffb15-3aa0-4304-a043-6b992628741c", "email": "j.courtel@noree.fr"}	email	2026-07-24 09:25:16.796998+00	2026-07-24 09:25:16.796998+00	2026-07-24 09:25:16.796998+00	7caffb15-3aa0-4304-a043-6b992628741c
csoyer@noree.fr	3ed8babd-c316-4dd4-b511-2ac6f098cbef	{"sub": "3ed8babd-c316-4dd4-b511-2ac6f098cbef", "email": "csoyer@noree.fr"}	email	2026-07-24 09:29:37.693755+00	2026-07-24 09:29:37.693755+00	2026-07-24 09:29:37.693755+00	3ed8babd-c316-4dd4-b511-2ac6f098cbef
j.basset@noree.fr	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	{"sub": "c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05", "email": "j.basset@noree.fr"}	email	2026-07-24 13:52:43.435223+00	2026-07-24 13:52:43.435223+00	2026-07-24 13:52:43.435223+00	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05
p.carmard@noree.fr	62e22fdb-05bf-4bfb-9e6a-74424ef46541	{"sub": "62e22fdb-05bf-4bfb-9e6a-74424ef46541", "email": "p.carmard@noree.fr"}	email	2026-07-24 14:04:37.217215+00	2026-07-24 14:04:37.217215+00	2026-07-24 14:04:37.217215+00	62e22fdb-05bf-4bfb-9e6a-74424ef46541
y.tassel@couvran.com	13280cb3-abfb-42c1-982f-514715a026ca	{"sub": "13280cb3-abfb-42c1-982f-514715a026ca", "email": "y.tassel@couvran.com"}	email	2026-07-27 14:08:19.443153+00	2026-07-27 14:08:19.443153+00	2026-07-27 14:08:19.443153+00	13280cb3-abfb-42c1-982f-514715a026ca
f.dayot@noree.fr	0ca4b72d-2641-4386-9b06-59df818bda02	{"sub": "0ca4b72d-2641-4386-9b06-59df818bda02", "email": "f.dayot@noree.fr"}	email	2026-07-30 12:55:49.516449+00	2026-07-30 12:55:49.516449+00	2026-07-30 12:55:49.516449+00	0ca4b72d-2641-4386-9b06-59df818bda02
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
4655c579-8b9d-4cbd-8023-6b21609a74ff	2026-09-11 14:10:09.756111+00	2026-09-11 14:10:09.756111+00	password	ccdc9042-5be7-4089-9fd3-5a315a3c5332
dcebb9e5-f757-420c-a828-bda6f3bdaab9	2026-09-11 14:17:49.366593+00	2026-09-11 14:17:49.366593+00	password	172bbd0f-bf80-453d-9a28-7521229b16e5
66e8d009-5a7d-4a13-b527-a69d02278e37	2026-09-11 14:25:59.139252+00	2026-09-11 14:25:59.139252+00	password	9788190b-4ddc-47a1-b3b5-98eded6d17ff
bcbc73f5-5c33-4a51-948c-59e0938d8935	2026-07-30 12:56:51.428798+00	2026-07-30 12:56:51.428798+00	password	ff899e40-9957-465b-b5d6-41aafdc0dad4
510f7565-88d3-4b15-8ccb-c37f9b28aa5f	2026-09-11 17:04:32.234365+00	2026-09-11 17:04:32.234365+00	password	92a8fc51-46af-4b14-a90b-f1a64593c913
7e1bb40f-d38d-43db-861e-3e8bed95e19a	2026-08-03 13:30:00.093643+00	2026-08-03 13:30:00.093643+00	password	c4c4787e-df7a-40fa-b790-182e6279bc75
5cb735bd-fea1-4977-8b28-8657ee63ef1c	2026-08-03 13:46:57.536258+00	2026-08-03 13:46:57.536258+00	password	e39c2042-96a2-48f4-bce2-3ff3ebf182bf
cd1e89ea-a366-41ec-b94d-6d6568c36ff1	2026-08-06 08:36:22.449654+00	2026-08-06 08:36:22.449654+00	password	efec2438-3c47-4237-91d2-74f75e2de192
a02b248d-ddd3-492f-9891-3b817ab77ac3	2026-07-24 09:02:24.009981+00	2026-07-24 09:02:24.009981+00	password	386a83be-8beb-476c-8172-4e6d0e3a73c8
a5a32025-ba8e-43e3-b620-1db522931e60	2026-07-24 09:03:52.236759+00	2026-07-24 09:03:52.236759+00	password	9cd60807-7da8-41d9-acf3-a61a90f22e70
d6c96e11-8e19-4b70-8998-a330829ca2d2	2026-07-24 09:13:29.487812+00	2026-07-24 09:13:29.487812+00	password	c4a02948-4088-482b-a2df-f2ba14fda5d3
3bdb60c0-a48b-4d12-9fa8-3401efaaee9b	2026-09-01 12:20:40.624793+00	2026-09-01 12:20:40.624793+00	otp	a23324da-fc12-4a1d-bc3f-cb3a3626ab8d
c11a805a-0f3e-4dfc-9255-30f462154e44	2026-07-24 09:47:53.017342+00	2026-07-24 09:47:53.017342+00	password	6ba9fe26-eaf3-4eb7-bba7-0ea515d11807
dad185aa-fcd1-4a89-82bf-4a74f787e900	2026-09-01 12:27:42.16945+00	2026-09-01 12:27:42.16945+00	otp	6ff5ea0d-f462-4e21-af84-08f937a55c5a
ea47cf40-71aa-439d-97ba-feae805c7582	2026-09-07 08:12:25.026197+00	2026-09-07 08:12:25.026197+00	password	5b4e0477-707d-49d4-8bd1-a490fa96d3e8
6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1	2026-07-24 14:08:15.078273+00	2026-07-24 14:08:15.078273+00	password	07cd5da2-f507-47a2-80ec-cd335f01f890
f886c738-78ea-4de5-802a-0b4630a19e95	2026-09-08 06:25:08.166142+00	2026-09-08 06:25:08.166142+00	password	f441dbf8-0c2d-4c1c-85d6-ee195c14b60f
738f14fc-e824-4b35-a923-7bf0ada8ad9b	2026-07-24 15:10:46.885351+00	2026-07-24 15:10:46.885351+00	password	f1e0d81c-a9bf-4387-a467-1b420a74166f
b8ae3fe6-41ef-4aab-9e38-b2a80941e035	2026-07-24 15:30:55.67363+00	2026-07-24 15:30:55.67363+00	password	b7f6e8fc-afbc-4000-bc42-a5c1a44e9bec
335386bb-2f02-4de8-9b90-07f410e13cca	2026-09-09 11:57:14.104768+00	2026-09-09 11:57:14.104768+00	password	2adb00e2-1c95-48e7-b2dd-dcae546e1ec2
aa15351e-6c70-4a1c-be1f-c433fd945632	2026-07-27 14:11:14.688235+00	2026-07-27 14:11:14.688235+00	password	18b31d78-d484-4a72-895b-c461dcff784f
23ec3c60-aaa3-4ed7-8b63-eacce53d6fc5	2026-07-27 14:57:04.795389+00	2026-07-27 14:57:04.795389+00	password	414a579c-4b97-470a-b005-3e6cdc10a10b
cfaf06d8-b01f-41e0-ab62-4190e9b72afa	2026-07-27 15:21:22.587153+00	2026-07-27 15:21:22.587153+00	password	f776acc6-5cfc-43bf-b58c-053dbd2d44c2
e54053fd-da5f-412d-8601-bb423e259060	2026-07-28 05:24:18.0215+00	2026-07-28 05:24:18.0215+00	password	bec6578a-8d57-40ad-bd72-fabe33a7b381
0ff26c47-2534-472f-84c5-a42cf7b08901	2026-07-30 05:59:58.577761+00	2026-07-30 05:59:58.577761+00	password	781865af-fb68-44a0-8158-59f98e5ea51f
ed64cbbf-8937-42b2-a4e7-4eb201be652d	2026-09-10 14:21:34.648052+00	2026-09-10 14:21:34.648052+00	password	8452a393-38ab-4dcd-9a70-476327b9dcc2
32dabb90-7594-4ec2-a522-be42f33355d6	2026-09-11 13:54:49.258794+00	2026-09-11 13:54:49.258794+00	password	e4548c3b-3cd6-4430-b991-61e04a17941a
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	323	ueiepudilk6e	c4aa0201-db24-4468-b0f6-f5fc6df0d095	t	2026-07-24 10:00:35.387506+00	2026-07-24 11:31:16.872764+00	isgyqdrljodj	a02b248d-ddd3-492f-9891-3b817ab77ac3
00000000-0000-0000-0000-000000000000	325	3hvkjt6j27e4	c4aa0201-db24-4468-b0f6-f5fc6df0d095	f	2026-07-24 11:31:16.888474+00	2026-07-24 11:31:16.888474+00	ueiepudilk6e	a02b248d-ddd3-492f-9891-3b817ab77ac3
00000000-0000-0000-0000-000000000000	360	uvfsms7ohmhk	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-27 09:22:50.655018+00	2026-07-27 14:23:37.475974+00	2tbkw3edqbjd	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	321	hjbsep5tqk7d	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-24 09:47:53.012372+00	2026-07-24 12:17:02.698258+00	\N	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	366	etb53zscnhhn	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-27 13:24:31.982181+00	2026-07-27 14:36:19.984953+00	yeguno3sh4zs	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	669	4hfdnueoch6w	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-04 12:10:03.094981+00	2026-09-04 13:19:07.866983+00	jzovnnlgbxpu	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	730	h5fcrlgjannu	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-08 14:19:06.235369+00	2026-09-08 16:20:17.670871+00	hrjkralvatpy	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	675	5osp4qs3mknm	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-04 14:42:08.195539+00	2026-09-07 05:07:55.520849+00	3darbzpwalja	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	706	7nh5ddsq7mah	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-08 05:30:01.072207+00	2026-09-10 07:23:43.689054+00	gdajmobg6bhr	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	831	73ndjrymsyb4	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-11 06:51:04.700337+00	2026-09-11 13:52:24.186412+00	mr37adfssg7d	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	374	yeacn37e5i3k	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-07-27 14:11:14.686529+00	2026-07-27 16:10:32.976099+00	\N	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	681	out67yngx7l7	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-07 06:56:08.101282+00	2026-09-07 11:27:56.21737+00	f3ph2hrl3ejc	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	327	2qka2gxxl755	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-24 12:17:02.704306+00	2026-07-24 13:45:51.594245+00	hjbsep5tqk7d	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	448	y7qq34gbjkoh	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-30 13:48:23.487297+00	2026-08-31 12:29:10.251734+00	3t7miisylee2	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	378	bc4dyx3mgnhv	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-27 14:36:19.990567+00	2026-07-28 05:16:02.928513+00	etb53zscnhhn	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	687	ksky4zxu4roc	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 09:35:03.753132+00	2026-09-07 12:04:55.260608+00	relvez6wlg4a	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	381	6jf3chrgbko2	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-27 15:21:22.574875+00	2026-07-28 05:22:58.909011+00	\N	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	386	3ol3y3xchat2	3ed8babd-c316-4dd4-b511-2ac6f098cbef	f	2026-07-28 05:24:18.011944+00	2026-07-28 05:24:18.011944+00	\N	e54053fd-da5f-412d-8601-bb423e259060
00000000-0000-0000-0000-000000000000	379	xak7t7fwu6kq	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-27 14:57:04.780258+00	2026-07-28 05:24:25.747148+00	\N	23ec3c60-aaa3-4ed7-8b63-eacce53d6fc5
00000000-0000-0000-0000-000000000000	339	azjohkmqq52b	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-24 14:08:15.07376+00	2026-07-24 15:06:23.172387+00	\N	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	377	5ugifldlk4we	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-27 14:23:37.477776+00	2026-07-28 05:52:03.607404+00	uvfsms7ohmhk	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	693	hykixrsn5dei	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 14:01:52.242598+00	2026-09-07 16:39:05.435938+00	qpkpzzlzsee4	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	699	64qssflspsgi	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-07 16:12:25.408285+00	2026-09-08 04:01:58.071976+00	zj6giioiqgqs	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	357	ubunscb7tf4t	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-07-27 08:48:25.870132+00	2026-07-28 05:52:14.90308+00	e3gxx54la4ez	d6c96e11-8e19-4b70-8998-a330829ca2d2
00000000-0000-0000-0000-000000000000	384	7m54vul6eb5i	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-28 05:16:02.945242+00	2026-07-28 06:13:41.741735+00	bc4dyx3mgnhv	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	714	2wgisu6t7ym7	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-08 07:49:49.454434+00	2026-09-08 10:03:05.161553+00	van2lywkblwd	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	385	x2dojtvkgcml	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-28 05:22:58.913993+00	2026-07-28 06:21:18.967301+00	6jf3chrgbko2	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	334	ko4pg2d57nwo	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-24 13:45:51.599621+00	2026-07-27 06:33:28.740946+00	2qka2gxxl755	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	389	k2esyfdjsvwp	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-07-28 05:52:14.903921+00	2026-07-28 06:53:07.231911+00	ubunscb7tf4t	d6c96e11-8e19-4b70-8998-a330829ca2d2
00000000-0000-0000-0000-000000000000	719	p34k2wjp4xdl	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-08 09:27:31.506606+00	2026-09-08 10:27:14.821839+00	jxp4dqhhrf5i	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	705	45dxu64md5r2	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-08 05:29:59.264953+00	2026-09-08 12:07:06.347125+00	azryktu5lutu	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	342	bqgy53f23cja	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-24 15:10:46.876618+00	2026-07-27 07:18:11.383964+00	\N	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	390	26wiofljj6pe	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-28 06:13:41.746516+00	2026-07-28 15:28:21.149449+00	7m54vul6eb5i	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	387	ywdzh45pemiy	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-28 05:24:25.74905+00	2026-07-28 19:27:43.434408+00	xak7t7fwu6kq	23ec3c60-aaa3-4ed7-8b63-eacce53d6fc5
00000000-0000-0000-0000-000000000000	373	lmspc574bz4d	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-27 14:10:59.17605+00	2026-07-29 04:22:59.474991+00	3nxcewxs27id	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	349	rm25znl7oxwh	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-27 06:33:28.751023+00	2026-07-27 08:09:39.484279+00	ko4pg2d57nwo	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	316	cu6mycvhca3q	c4aa0201-db24-4468-b0f6-f5fc6df0d095	f	2026-07-24 09:03:52.230649+00	2026-07-24 09:03:52.230649+00	\N	a5a32025-ba8e-43e3-b620-1db522931e60
00000000-0000-0000-0000-000000000000	388	ngf5bpw3iukv	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-28 05:52:03.624057+00	2026-07-30 04:50:16.894106+00	5ugifldlk4we	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	382	snhbmca4ught	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-07-27 16:10:32.995083+00	2026-07-30 05:24:05.093813+00	yeacn37e5i3k	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	724	hrjkralvatpy	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-08 12:40:21.861331+00	2026-09-08 14:19:06.224894+00	htem64tfobcu	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	356	aqwh54hsytje	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-27 08:45:49.528275+00	2026-07-30 06:52:00.672915+00	az4rk7pmbvyj	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	341	az4rk7pmbvyj	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-24 15:06:23.183122+00	2026-07-27 08:45:49.523217+00	azjohkmqq52b	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	315	isgyqdrljodj	c4aa0201-db24-4468-b0f6-f5fc6df0d095	t	2026-07-24 09:02:24.005086+00	2026-07-24 10:00:35.379945+00	\N	a02b248d-ddd3-492f-9891-3b817ab77ac3
00000000-0000-0000-0000-000000000000	317	e3gxx54la4ez	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-07-24 09:13:29.474257+00	2026-07-27 08:48:25.866656+00	\N	d6c96e11-8e19-4b70-8998-a330829ca2d2
00000000-0000-0000-0000-000000000000	354	vqhq54vwe2or	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-27 08:09:39.496267+00	2026-07-27 09:22:25.469702+00	rm25znl7oxwh	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	351	2tbkw3edqbjd	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-27 07:18:11.388925+00	2026-07-27 09:22:50.646728+00	bqgy53f23cja	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	344	3rmcwjvzf6ei	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-24 15:30:55.666405+00	2026-07-27 11:36:21.783282+00	\N	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	362	fnighfdjnoqu	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-27 11:36:21.800122+00	2026-07-27 13:03:05.980304+00	3rmcwjvzf6ei	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	359	yeguno3sh4zs	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-27 09:22:25.47365+00	2026-07-27 13:24:31.976615+00	vqhq54vwe2or	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	365	3nxcewxs27id	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-27 13:03:05.988967+00	2026-07-27 14:10:59.168309+00	fnighfdjnoqu	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	433	ikszvtpecp3q	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-30 09:41:23.124392+00	2026-07-30 12:15:22.192497+00	q5d3ajlqs6k4	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	393	2kvw55mtrhtz	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	f	2026-07-28 06:53:07.24376+00	2026-07-28 06:53:07.24376+00	k2esyfdjsvwp	d6c96e11-8e19-4b70-8998-a330829ca2d2
00000000-0000-0000-0000-000000000000	832	4iodchouokv3	0ca4b72d-2641-4386-9b06-59df818bda02	f	2026-09-11 07:12:17.043338+00	2026-09-11 07:12:17.043338+00	thxqdpeynb2y	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	435	5ovtg5rr7wdh	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-30 09:54:46.857939+00	2026-07-30 12:16:05.341201+00	jjlr56o54f7m	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	392	tjicpqv4vivv	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-28 06:21:18.967721+00	2026-07-28 14:56:50.107294+00	x2dojtvkgcml	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	733	jilvs24oc2jq	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-08 15:12:29.245739+00	2026-09-09 09:30:22.624731+00	exebzxs3y4s6	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	670	vdztcqsrduyp	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-04 12:16:20.983622+00	2026-09-04 13:29:26.747662+00	by34gzjwvbom	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	398	dkvrhjuynp6h	2407b7ed-f057-4b44-842f-7026dce4f5eb	f	2026-07-28 19:27:43.455039+00	2026-07-28 19:27:43.455039+00	ywdzh45pemiy	23ec3c60-aaa3-4ed7-8b63-eacce53d6fc5
00000000-0000-0000-0000-000000000000	432	2cpcgdbrgo4s	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-30 09:39:58.443915+00	2026-07-30 13:19:29.993748+00	zdkstgjzpwom	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	443	trdtlwiuqezr	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-30 12:16:05.341621+00	2026-07-30 13:38:39.733213+00	5ovtg5rr7wdh	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	700	upod2xf3m6a4	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 16:39:05.445587+00	2026-09-10 07:04:35.190291+00	hykixrsn5dei	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	397	jkupwdkkzuzl	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-28 15:28:21.164661+00	2026-07-29 06:39:46.56397+00	26wiofljj6pe	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	442	3t7miisylee2	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-30 12:15:22.201621+00	2026-07-30 13:48:23.478812+00	ikszvtpecp3q	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	399	3f2csvvhx6xm	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-29 04:22:59.495929+00	2026-07-29 06:45:32.799041+00	lmspc574bz4d	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	417	b6lpkax7uqba	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-07-30 06:59:18.605601+00	2026-07-30 13:58:04.94+00	5rau6qwo2uma	0ff26c47-2534-472f-84c5-a42cf7b08901
00000000-0000-0000-0000-000000000000	449	3bnk3rbllkfp	13280cb3-abfb-42c1-982f-514715a026ca	f	2026-07-30 13:58:04.950292+00	2026-07-30 13:58:04.950292+00	b6lpkax7uqba	0ff26c47-2534-472f-84c5-a42cf7b08901
00000000-0000-0000-0000-000000000000	428	yb52eg57ndpa	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-30 09:26:22.978794+00	2026-07-30 14:03:45.8703+00	jgirxf5mncdc	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	446	lgkyedfhi6rw	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-30 13:19:30.002594+00	2026-07-30 14:16:51.26731+00	2cpcgdbrgo4s	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	401	672pqj4pgqoz	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-29 06:39:46.581677+00	2026-07-29 10:14:39.046114+00	jkupwdkkzuzl	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	834	sbuzfrb4pqor	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-11 07:33:55.693676+00	2026-09-11 08:31:25.765864+00	voxdteievzlx	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	405	4gg67jo3hpmk	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-29 10:14:39.056716+00	2026-07-29 15:06:24.161445+00	672pqj4pgqoz	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	682	hydfuhyt23vh	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 07:39:03.561691+00	2026-09-07 08:37:03.38876+00	elavvp7hge7w	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	402	2koc5uuedu7h	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-29 06:45:32.807692+00	2026-07-29 15:56:54.238278+00	3f2csvvhx6xm	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	445	qp7dkcvb4nhf	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-07-30 12:56:51.426326+00	2026-08-18 09:00:25.340976+00	\N	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	408	nq4fmwzyzfwk	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-29 15:56:54.250866+00	2026-07-29 16:54:30.432985+00	2koc5uuedu7h	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	451	ukasjiukbn3e	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-30 14:16:51.275239+00	2026-07-30 15:14:11.209471+00	lgkyedfhi6rw	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	455	ufl3zzivis5e	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-30 15:14:11.22005+00	2026-07-30 16:11:41.537861+00	ukasjiukbn3e	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	447	dhnp3m4yhnnv	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-30 13:38:39.741478+00	2026-08-27 06:46:52.146943+00	trdtlwiuqezr	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	450	ymhksdddg73n	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-30 14:03:45.878483+00	2026-07-31 08:12:06.151376+00	yb52eg57ndpa	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	407	zghycwuw5rv4	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-29 15:06:24.169497+00	2026-07-30 06:08:33.303314+00	4gg67jo3hpmk	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	437	avm6m4mqp7nx	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-30 10:18:17.102985+00	2026-07-31 08:12:54.903189+00	6ch5xdposchc	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	694	vkg7wgb45k3s	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-07 14:13:30.795779+00	2026-09-07 15:23:35.899087+00	fdogsfloh2ml	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	414	5rau6qwo2uma	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-07-30 05:59:58.556875+00	2026-07-30 06:59:18.597656+00	\N	0ff26c47-2534-472f-84c5-a42cf7b08901
00000000-0000-0000-0000-000000000000	522	qvqrohtenobf	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-08-22 07:54:32.412731+00	2026-08-31 19:52:07.28276+00	fkwyxwmkxp3x	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	415	rmxhi426gcau	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-30 06:08:33.310459+00	2026-07-30 07:14:03.350154+00	zghycwuw5rv4	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	434	nllrmfxag5kx	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-07-30 09:47:57.183736+00	2026-08-03 07:16:57.079293+00	kvxvcrlkm2jg	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	688	zj6giioiqgqs	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-07 10:22:50.019022+00	2026-09-07 16:12:25.396022+00	jd43depdm45g	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	409	rweycjmsfxzo	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-29 16:54:30.450609+00	2026-07-30 07:35:39.434326+00	nq4fmwzyzfwk	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	416	o7p66qrbuior	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-30 06:52:00.684855+00	2026-07-30 07:49:34.913882+00	aqwh54hsytje	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	418	xkpw6r66akdz	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-30 07:14:03.359648+00	2026-07-30 08:15:40.572676+00	rmxhi426gcau	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	410	dcv5wdgnyvtl	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-30 04:50:16.914806+00	2026-07-30 08:42:48.891503+00	ngf5bpw3iukv	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	411	j3a35isbjhia	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-07-30 05:24:05.112657+00	2026-07-30 08:46:54.633406+00	snhbmca4ught	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	421	dsbqdywkf227	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-30 07:35:39.442484+00	2026-07-30 08:53:57.415612+00	rweycjmsfxzo	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	396	fuwaenholdk4	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-28 14:56:50.128937+00	2026-07-30 08:55:44.886947+00	tjicpqv4vivv	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	423	jgirxf5mncdc	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-30 08:15:40.588353+00	2026-07-30 09:26:22.971702+00	xkpw6r66akdz	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	422	zdkstgjzpwom	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-30 07:49:34.921568+00	2026-07-30 09:39:58.443492+00	o7p66qrbuior	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	424	q5d3ajlqs6k4	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-07-30 08:42:48.906025+00	2026-07-30 09:41:23.117459+00	dcv5wdgnyvtl	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	425	kvxvcrlkm2jg	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-07-30 08:46:54.639805+00	2026-07-30 09:47:57.178988+00	j3a35isbjhia	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	427	jjlr56o54f7m	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-07-30 08:55:44.887738+00	2026-07-30 09:54:46.84878+00	fuwaenholdk4	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	426	6ch5xdposchc	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-30 08:53:57.420537+00	2026-07-30 10:18:17.096533+00	dsbqdywkf227	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	731	f34wlbqj3dqh	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-08 14:32:17.656466+00	2026-09-08 15:30:31.955201+00	viid7o7rptdd	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	695	z7cldyoyk234	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-09-07 14:23:41.327324+00	2026-09-08 15:55:18.450464+00	g4x3gvv6it5y	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	734	apvdo4msm5hl	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-08 15:30:31.960388+00	2026-09-08 16:28:41.27287+00	f34wlbqj3dqh	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	671	qm3fgxmdvifc	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-04 13:19:07.888767+00	2026-09-07 06:26:24.249392+00	4hfdnueoch6w	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	459	h77ujtnxuero	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-31 08:12:06.175831+00	2026-07-31 09:09:39.500379+00	ymhksdddg73n	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	460	gi7nffu5r5ob	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-31 08:12:54.903702+00	2026-07-31 09:22:37.895393+00	avm6m4mqp7nx	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	611	tzdh3sodtsll	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-02 08:50:35.071711+00	2026-09-02 10:20:55.071941+00	z3t2zc2gajan	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	607	mkvvj2t5zxxk	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-01 16:39:59.884614+00	2026-09-02 15:01:02.151187+00	vb37rt2wruab	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	462	an7sae3xwhqy	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-31 09:22:37.908432+00	2026-07-31 10:33:55.681358+00	gi7nffu5r5ob	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	521	fkwyxwmkxp3x	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-08-18 09:00:25.358687+00	2026-08-22 07:54:32.382558+00	qp7dkcvb4nhf	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	461	tdqy2pszgyg3	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-31 09:09:39.527445+00	2026-07-31 10:36:13.207579+00	h77ujtnxuero	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	683	jd43depdm45g	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-07 08:12:25.015104+00	2026-09-07 10:22:50.007957+00	\N	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	742	usbqdcqsnegv	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-09 06:24:08.054608+00	2026-09-09 07:48:33.905952+00	uuu6v7avpqzu	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	465	vovpkwvexe3q	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-07-31 10:36:13.216811+00	2026-08-27 05:44:28.579784+00	tdqy2pszgyg3	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	464	ycfikj7us4dt	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-31 10:33:55.692275+00	2026-07-31 14:25:42.237735+00	an7sae3xwhqy	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	689	opfpa5mbirl4	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-07 11:27:56.232525+00	2026-09-07 12:46:00.53223+00	out67yngx7l7	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	526	bzouogkqzduy	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-27 05:44:28.588707+00	2026-08-27 07:00:54.807667+00	vovpkwvexe3q	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	470	q5myunpfqljo	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-03 07:16:57.104203+00	2026-08-03 08:28:05.814368+00	nllrmfxag5kx	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	471	zvbra2gx6zrh	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-03 08:28:05.830918+00	2026-08-03 13:29:59.489051+00	q5myunpfqljo	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	472	7lrr6ep25qgb	13280cb3-abfb-42c1-982f-514715a026ca	f	2026-08-03 13:29:59.511115+00	2026-08-03 13:29:59.511115+00	zvbra2gx6zrh	aa15351e-6c70-4a1c-be1f-c433fd945632
00000000-0000-0000-0000-000000000000	677	azryktu5lutu	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-07 05:07:55.542317+00	2026-09-08 05:29:59.245813+00	5osp4qs3mknm	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	842	2yk4r7ix3nzt	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-11 08:31:25.774516+00	2026-09-11 09:28:56.297212+00	sbuzfrb4pqor	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	468	5oahkpfwldsj	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-07-31 14:25:42.248335+00	2026-08-27 07:49:56.676462+00	ycfikj7us4dt	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	528	dyllzyydp54g	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-27 07:00:54.817779+00	2026-08-27 07:57:54.807695+00	bzouogkqzduy	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	503	732co2chvb4h	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-06 12:10:56.161349+00	2026-09-08 06:49:13.003499+00	b6yvd4j675bq	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	720	2qzu73ionjgh	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-08 09:57:02.060588+00	2026-09-10 08:15:20.169743+00	jutkwd245wka	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	530	z543ysnc7qhb	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-08-27 07:49:56.695425+00	2026-08-27 09:31:35.148761+00	5oahkpfwldsj	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	474	2jslubkddf4k	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-08-03 13:46:57.521788+00	2026-08-04 06:19:22.690594+00	\N	5cb735bd-fea1-4977-8b28-8657ee63ef1c
00000000-0000-0000-0000-000000000000	531	axdjbpxewkim	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-27 07:57:54.815638+00	2026-08-27 11:45:32.206121+00	dyllzyydp54g	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	482	lq357sw4bjsz	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-08-04 06:19:22.713821+00	2026-08-04 07:17:28.112109+00	2jslubkddf4k	5cb735bd-fea1-4977-8b28-8657ee63ef1c
00000000-0000-0000-0000-000000000000	483	7bxqis7vmrrh	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	f	2026-08-04 07:17:28.119246+00	2026-08-04 07:17:28.119246+00	lq357sw4bjsz	5cb735bd-fea1-4977-8b28-8657ee63ef1c
00000000-0000-0000-0000-000000000000	473	qoixbtld22wm	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-03 13:30:00.084489+00	2026-08-05 07:30:00.664354+00	\N	7e1bb40f-d38d-43db-861e-3e8bed95e19a
00000000-0000-0000-0000-000000000000	725	viid7o7rptdd	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-08 12:49:36.574346+00	2026-09-08 14:32:17.646972+00	fa3rotzigcv7	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	485	hzwivp6pfdzo	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-05 07:30:00.68646+00	2026-08-05 08:38:36.030741+00	qoixbtld22wm	7e1bb40f-d38d-43db-861e-3e8bed95e19a
00000000-0000-0000-0000-000000000000	486	sqxem3uqj5dr	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-05 08:38:36.046657+00	2026-08-05 11:23:43.965013+00	hzwivp6pfdzo	7e1bb40f-d38d-43db-861e-3e8bed95e19a
00000000-0000-0000-0000-000000000000	534	3d4m43x5tkvw	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-27 11:45:32.221788+00	2026-08-27 13:12:36.770243+00	axdjbpxewkim	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	487	bfqrpup7arwa	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-05 11:23:43.992097+00	2026-08-05 15:03:13.999258+00	sqxem3uqj5dr	7e1bb40f-d38d-43db-861e-3e8bed95e19a
00000000-0000-0000-0000-000000000000	536	iixd6oaikaft	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-27 13:12:36.790088+00	2026-08-27 14:09:58.205341+00	3d4m43x5tkvw	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	527	6xu6ivb4vlie	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-08-27 06:46:52.161782+00	2026-08-28 05:23:45.121093+00	dhnp3m4yhnnv	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	538	tj7qvisywizt	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-27 14:09:58.217919+00	2026-08-28 05:24:17.567943+00	iixd6oaikaft	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	533	ja62ni7cbo2z	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-08-27 09:31:35.171516+00	2026-08-31 05:13:41.170475+00	z543ysnc7qhb	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	456	qcu6walqfuv4	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-07-30 16:11:41.555835+00	2026-08-31 08:14:51.831976+00	ufl3zzivis5e	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	488	gzj2fplslt5g	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-05 15:03:14.018661+00	2026-08-06 08:36:21.794044+00	bfqrpup7arwa	7e1bb40f-d38d-43db-861e-3e8bed95e19a
00000000-0000-0000-0000-000000000000	500	yoekul36av6b	13280cb3-abfb-42c1-982f-514715a026ca	f	2026-08-06 08:36:21.823217+00	2026-08-06 08:36:21.823217+00	gzj2fplslt5g	7e1bb40f-d38d-43db-861e-3e8bed95e19a
00000000-0000-0000-0000-000000000000	501	jaftylo6ng4g	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-06 08:36:22.443565+00	2026-08-06 09:41:43.705258+00	\N	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	502	b6yvd4j675bq	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-08-06 09:41:43.723829+00	2026-08-06 12:10:56.146423+00	jaftylo6ng4g	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	570	wfrdi746g7if	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-31 11:46:47.635561+00	2026-09-01 16:14:15.657474+00	tzjxjynsdfel	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	583	4auk3r6dagvl	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 16:38:50.767716+00	2026-09-02 15:26:23.05624+00	5p5y6jn3pzs3	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	540	ib52snovimjx	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-28 05:24:17.569467+00	2026-08-28 07:03:24.618594+00	tj7qvisywizt	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	542	hlj7uks5yngq	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-28 07:03:24.63532+00	2026-08-28 08:02:31.744488+00	ib52snovimjx	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	543	zli352drvsjc	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-28 08:02:31.750269+00	2026-08-28 09:07:26.05705+00	hlj7uks5yngq	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	672	lnn4ncedvs7x	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-04 13:25:17.875921+00	2026-09-07 08:57:51.203755+00	fpw75n352s5w	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	743	4y3uzzd54o3n	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-09 06:27:27.143847+00	2026-09-09 08:41:25.079492+00	afzlyysum232	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	544	jl7mx6l7bklx	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-28 09:07:26.076514+00	2026-08-28 10:05:15.20823+00	zli352drvsjc	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	690	a3jh2m7gd2lq	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 12:04:55.275025+00	2026-09-07 13:03:05.593573+00	ksky4zxu4roc	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	546	gly6u37qhihl	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-28 10:05:15.215783+00	2026-08-28 13:04:15.463555+00	jl7mx6l7bklx	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	684	g4x3gvv6it5y	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-09-07 08:35:21.917919+00	2026-09-07 14:23:41.317343+00	lmdi5uefelaj	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	539	kv4zkdbyn2uz	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-08-28 05:23:45.136918+00	2026-08-29 09:26:16.324281+00	6xu6ivb4vlie	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	547	llayh67tdnfr	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-28 13:04:15.490858+00	2026-08-31 05:05:20.499079+00	gly6u37qhihl	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	752	35zn4fnfduxu	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-09 09:30:22.6414+00	2026-09-09 10:41:37.335462+00	jilvs24oc2jq	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	548	l5rcnjteybmh	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-08-29 09:26:16.349064+00	2026-08-31 05:44:57.665821+00	kv4zkdbyn2uz	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	551	pax3hxs2pnpf	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-31 05:05:20.500082+00	2026-08-31 06:03:03.743136+00	llayh67tdnfr	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	716	jutkwd245wka	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-08 08:54:37.644773+00	2026-09-08 09:57:02.046714+00	yavanzt7ynvf	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	721	fa3rotzigcv7	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-08 10:03:05.170496+00	2026-09-08 12:49:36.569219+00	2wgisu6t7ym7	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	726	obxqwpvdewin	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-08 13:06:21.69839+00	2026-09-08 14:04:11.240683+00	sg32t6ttja74	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	552	d5stvkzjif4b	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-08-31 05:13:41.181665+00	2026-08-31 08:10:28.812494+00	ja62ni7cbo2z	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	711	syzppxaooujb	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-09-08 06:25:08.160802+00	2026-09-08 14:05:09.542382+00	\N	f886c738-78ea-4de5-802a-0b4630a19e95
00000000-0000-0000-0000-000000000000	747	bp4ttbaexdq6	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-09 08:41:25.087283+00	2026-09-09 12:41:06.038413+00	4y3uzzd54o3n	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	553	bvpkhkalrl55	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-08-31 05:44:57.681195+00	2026-08-31 08:31:10.745117+00	l5rcnjteybmh	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	758	wixquyzrynep	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-09 12:17:39.08337+00	2026-09-09 13:36:49.01788+00	usvv273o4rbj	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	557	uv4hc3vdohw3	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-08-31 08:10:28.814249+00	2026-08-31 09:07:59.274231+00	d5stvkzjif4b	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	558	yvazea54xocl	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 08:14:51.841381+00	2026-08-31 09:12:22.270067+00	qcu6walqfuv4	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	554	nyausdzqmc3b	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-31 06:03:03.752417+00	2026-08-31 09:31:24.654297+00	pax3hxs2pnpf	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	559	y4vocmwdtsc4	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-08-31 08:31:10.753817+00	2026-08-31 09:54:56.1802+00	bvpkhkalrl55	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	764	64bi4ic4frko	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-09 13:52:30.242253+00	2026-09-09 15:06:06.147587+00	bwrhkvxpsuja	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	768	7fl3nstusbyq	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-09 14:38:13.178873+00	2026-09-09 15:43:04.412403+00	eyv562klxm2g	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	748	7hyzeepm5vmb	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-09 08:41:46.96329+00	2026-09-10 04:36:00.723496+00	y3fxddmmmq5x	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	735	reszu7yrtv3v	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-09-08 15:55:18.466027+00	2026-09-10 12:20:30.647403+00	z7cldyoyk234	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	562	pahz4glwu3hn	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 09:12:22.280216+00	2026-08-31 10:09:52.326022+00	yvazea54xocl	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	564	eh3ycn4pbzbu	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-31 09:31:24.658654+00	2026-08-31 10:35:23.323018+00	nyausdzqmc3b	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	569	tzjxjynsdfel	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-08-31 10:35:23.337461+00	2026-08-31 11:46:47.621574+00	eh3ycn4pbzbu	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	568	wvwomn3di72q	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 10:09:52.33563+00	2026-08-31 12:14:03.975132+00	pahz4glwu3hn	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	572	nkfc5cmgabmx	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 12:14:03.984266+00	2026-08-31 13:11:33.644573+00	wvwomn3di72q	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	577	6zivpeurq7mq	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 13:11:33.650086+00	2026-08-31 14:42:06.106277+00	nkfc5cmgabmx	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	580	ivyfo4czcdgl	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 14:42:06.124092+00	2026-08-31 15:39:36.006705+00	6zivpeurq7mq	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	582	5p5y6jn3pzs3	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-08-31 15:39:36.023538+00	2026-08-31 16:38:50.753701+00	ivyfo4czcdgl	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	561	sxzd4s6hyhc3	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-08-31 09:07:59.2803+00	2026-09-01 05:51:07.541297+00	uv4hc3vdohw3	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	565	iyez6tgv45mr	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-08-31 09:54:56.198534+00	2026-09-01 07:46:57.670507+00	y4vocmwdtsc4	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	587	fqchnarblgjx	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-01 07:46:57.683725+00	2026-09-01 09:13:58.683096+00	iyez6tgv45mr	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	584	hysj3kf2qji7	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-08-31 19:52:07.295664+00	2026-09-01 09:37:05.719478+00	qvqrohtenobf	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	589	jlqujbptc3ni	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-09-01 09:37:05.726409+00	2026-09-01 12:17:59.531936+00	hysj3kf2qji7	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	574	gcacskebdbrm	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-08-31 12:29:10.259883+00	2026-09-01 12:30:08.513669+00	y7qq34gbjkoh	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	585	sprtt5esdcpl	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-01 05:51:07.563855+00	2026-09-01 13:00:57.348212+00	sxzd4s6hyhc3	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	588	wag3s6uiuxlt	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-01 09:13:58.696353+00	2026-09-01 15:09:40.95547+00	fqchnarblgjx	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	603	vb37rt2wruab	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-01 15:09:40.963822+00	2026-09-01 16:39:59.871561+00	wag3s6uiuxlt	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	598	7ipcg76wykwt	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-01 13:42:18.490947+00	2026-09-02 06:00:22.851446+00	yhjomcvlk7su	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	703	xvkjgjq6pjqb	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-08 04:01:58.09885+00	2026-09-09 04:40:08.213181+00	64qssflspsgi	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	608	ztw6dhuppfis	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-02 06:00:22.865923+00	2026-09-02 07:43:04.146624+00	7ipcg76wykwt	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	673	f3ph2hrl3ejc	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-04 13:29:26.755976+00	2026-09-07 06:56:08.090824+00	vdztcqsrduyp	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	592	tw66psk3hvkj	a8602130-044c-4c55-b726-9f4adaeb8f00	t	2026-09-01 12:20:40.620786+00	2026-09-01 13:18:49.757973+00	\N	3bdb60c0-a48b-4d12-9fa8-3401efaaee9b
00000000-0000-0000-0000-000000000000	597	pbfijdqr2ggz	a8602130-044c-4c55-b726-9f4adaeb8f00	f	2026-09-01 13:18:49.765206+00	2026-09-01 13:18:49.765206+00	tw66psk3hvkj	3bdb60c0-a48b-4d12-9fa8-3401efaaee9b
00000000-0000-0000-0000-000000000000	594	yhjomcvlk7su	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-01 12:30:08.522547+00	2026-09-01 13:42:18.47564+00	gcacskebdbrm	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	600	lmdi5uefelaj	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-09-01 14:09:41.34668+00	2026-09-07 08:35:21.905246+00	sewa5yi56kkx	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	596	3xq43q5jhvd3	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-01 13:00:57.350344+00	2026-09-01 13:58:27.839741+00	sprtt5esdcpl	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	605	z3t2zc2gajan	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-01 16:01:12.362096+00	2026-09-02 08:50:35.060433+00	k2ncnhqmf4lw	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	591	sewa5yi56kkx	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-09-01 12:17:59.546578+00	2026-09-01 14:09:41.338972+00	jlqujbptc3ni	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	736	afzlyysum232	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-08 16:20:17.682024+00	2026-09-09 06:27:27.135302+00	h5fcrlgjannu	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	740	y3fxddmmmq5x	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-09 04:40:08.228322+00	2026-09-09 08:41:46.962854+00	xvkjgjq6pjqb	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	599	uyn4yd45fh4n	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-01 13:58:27.850054+00	2026-09-01 14:55:44.820997+00	3xq43q5jhvd3	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	744	pfmlog2phqu7	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-09 07:48:33.922299+00	2026-09-09 08:46:35.923498+00	usbqdcqsnegv	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	685	relvez6wlg4a	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 08:37:03.395414+00	2026-09-07 09:35:03.735707+00	hydfuhyt23vh	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	749	6c6vrnpkiavv	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-09 08:46:35.931995+00	2026-09-09 09:44:37.431872+00	pfmlog2phqu7	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	602	k2ncnhqmf4lw	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-01 14:55:44.8343+00	2026-09-01 16:01:12.341635+00	uyn4yd45fh4n	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	691	fdogsfloh2ml	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-07 12:46:00.553962+00	2026-09-07 14:13:30.781791+00	opfpa5mbirl4	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	610	t3w7i5xbxfhc	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-02 07:43:04.162547+00	2026-09-02 09:36:50.04798+00	ztw6dhuppfis	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	679	squusxkh63i5	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-07 06:26:24.261867+00	2026-09-07 15:47:23.023765+00	qm3fgxmdvifc	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	613	x7c3bxtdqxid	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-02 09:36:50.0597+00	2026-09-02 13:25:28.054066+00	t3w7i5xbxfhc	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	697	mus67rhsfaw2	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-07 15:23:35.910586+00	2026-09-08 05:07:38.842081+00	vkg7wgb45k3s	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	606	ryzn72y3rruh	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-01 16:14:15.670256+00	2026-09-02 14:53:50.9509+00	wfrdi746g7if	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	712	jxp4dqhhrf5i	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-08 06:49:13.011202+00	2026-09-08 09:27:31.497061+00	732co2chvb4h	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	616	i7hprjxgnmby	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-02 13:25:28.06359+00	2026-09-02 16:19:05.488872+00	x7c3bxtdqxid	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	619	yu2iindcig65	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-02 15:26:23.064319+00	2026-09-02 16:39:16.095696+00	4auk3r6dagvl	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	722	htem64tfobcu	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-08 10:27:14.831281+00	2026-09-08 12:40:21.84301+00	p34k2wjp4xdl	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	618	l6rw2dlf3zr4	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-02 15:01:02.158237+00	2026-09-02 16:45:41.995046+00	mkvvj2t5zxxk	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	614	dc5gzkg7lsri	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-02 10:20:55.080932+00	2026-09-03 05:13:16.153766+00	tzdh3sodtsll	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	753	vibzhovhumqy	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-09 09:44:37.437996+00	2026-09-09 13:40:18.695317+00	6c6vrnpkiavv	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	624	262runbrsezk	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-03 05:13:16.175694+00	2026-09-03 06:10:44.791897+00	dc5gzkg7lsri	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	759	bwrhkvxpsuja	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-09 12:41:06.047684+00	2026-09-09 13:52:30.235966+00	bp4ttbaexdq6	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	625	miqsmhy2l76t	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-03 06:10:44.816298+00	2026-09-03 07:17:20.229747+00	262runbrsezk	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	762	b7zuk7tzxf5j	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-09 13:36:49.025999+00	2026-09-09 15:01:43.264526+00	wixquyzrynep	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	620	xxi4p3xwaee5	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-02 16:19:05.498841+00	2026-09-03 07:47:46.734341+00	i7hprjxgnmby	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	623	qt2kknpxvw56	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-02 16:45:41.997062+00	2026-09-03 08:09:22.883648+00	l6rw2dlf3zr4	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	627	digo3pbevsl7	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-03 07:17:20.238853+00	2026-09-03 08:14:53.079939+00	miqsmhy2l76t	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	593	nfxuvaek6m2d	9f85d70f-f03b-4b59-a65a-a333889c66f7	t	2026-09-01 12:27:42.165337+00	2026-09-03 08:25:45.305306+00	\N	dad185aa-fcd1-4a89-82bf-4a74f787e900
00000000-0000-0000-0000-000000000000	630	2ar7qoykcdh6	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-03 08:09:22.892352+00	2026-09-03 09:13:54.922198+00	qt2kknpxvw56	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	629	wfvqmuef4ieo	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-03 07:47:46.743342+00	2026-09-03 09:14:30.707769+00	xxi4p3xwaee5	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	631	l2xqtck7cvsc	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-03 08:14:53.088934+00	2026-09-03 09:59:17.50222+00	digo3pbevsl7	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	635	c3kiugurccfk	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-03 09:13:54.927176+00	2026-09-03 10:11:20.244608+00	2ar7qoykcdh6	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	636	sued37kzndea	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-03 09:14:30.718399+00	2026-09-03 10:12:00.331383+00	wfvqmuef4ieo	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	617	ljynixxn2gil	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-02 14:53:50.975+00	2026-09-03 13:36:44.745049+00	ryzn72y3rruh	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	621	gcjgwcv25ocz	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-02 16:39:16.104639+00	2026-09-03 16:12:23.862545+00	yu2iindcig65	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	632	46vxquni5b3r	9f85d70f-f03b-4b59-a65a-a333889c66f7	t	2026-09-03 08:25:45.316619+00	2026-09-04 05:36:10.356733+00	nfxuvaek6m2d	dad185aa-fcd1-4a89-82bf-4a74f787e900
00000000-0000-0000-0000-000000000000	668	jzovnnlgbxpu	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-04 11:12:49.31843+00	2026-09-04 12:10:03.073723+00	jeylsl4wfudu	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	662	by34gzjwvbom	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-04 05:59:38.725536+00	2026-09-04 12:16:20.974324+00	ut7p5dsfsgej	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	666	fpw75n352s5w	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-04 09:05:17.882697+00	2026-09-04 13:25:17.866994+00	hroyfgtupwbz	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	728	exebzxs3y4s6	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-08 14:04:11.249042+00	2026-09-08 15:12:29.24371+00	obxqwpvdewin	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	643	bnc46cjqqook	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-03 10:11:20.255212+00	2026-09-03 12:43:26.019313+00	c3kiugurccfk	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	659	3darbzpwalja	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-03 15:35:18.901509+00	2026-09-04 14:42:08.184322+00	24amau3p744y	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	644	5bexwey5gflo	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-03 10:12:00.332336+00	2026-09-03 12:43:49.144191+00	sued37kzndea	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	660	6dmkaom2dlzy	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-03 16:12:23.873713+00	2026-09-07 06:40:54.400036+00	gcjgwcv25ocz	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	836	kv655mdjc6a6	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-11 08:01:40.803129+00	2026-09-11 13:46:04.351518+00	gh2txhqwzavj	335386bb-2f02-4de8-9b90-07f410e13cca
00000000-0000-0000-0000-000000000000	680	elavvp7hge7w	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 06:40:54.408538+00	2026-09-07 07:39:03.550934+00	6dmkaom2dlzy	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	737	uuu6v7avpqzu	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-08 16:28:41.278101+00	2026-09-09 06:24:08.046385+00	apvdo4msm5hl	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	642	wnsq66j2nk26	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-03 09:59:17.513636+00	2026-09-03 13:11:06.754526+00	l2xqtck7cvsc	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	648	twpxf7z3jyas	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-03 12:43:49.145386+00	2026-09-03 13:41:15.19337+00	5bexwey5gflo	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	692	qpkpzzlzsee4	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-07 13:03:05.610641+00	2026-09-07 14:01:52.227567+00	a3jh2m7gd2lq	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	729	rv3ffctqk2lh	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-09-08 14:05:09.545312+00	2026-09-09 08:59:47.954925+00	syzppxaooujb	f886c738-78ea-4de5-802a-0b4630a19e95
00000000-0000-0000-0000-000000000000	698	gdajmobg6bhr	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-07 15:47:23.033696+00	2026-09-08 05:30:01.071781+00	squusxkh63i5	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	654	zi6m6mlipb4u	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-03 13:41:15.200405+00	2026-09-03 14:38:29.965915+00	twpxf7z3jyas	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	704	r5kf47np5ood	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-08 05:07:38.858515+00	2026-09-08 07:17:20.277703+00	mus67rhsfaw2	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	653	ovlfdm7qyci7	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-03 13:36:44.7548+00	2026-09-03 15:26:19.386682+00	ljynixxn2gil	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	647	24amau3p744y	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-03 12:43:26.038759+00	2026-09-03 15:35:18.888855+00	bnc46cjqqook	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	754	usvv273o4rbj	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-09 10:41:37.34888+00	2026-09-09 12:17:39.073003+00	35zn4fnfduxu	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	658	ut7p5dsfsgej	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-03 15:26:19.405682+00	2026-09-04 05:59:38.713343+00	ovlfdm7qyci7	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	686	van2lywkblwd	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-07 08:57:51.21199+00	2026-09-08 07:49:49.443132+00	lnn4ncedvs7x	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	652	phazxlxswsmb	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-03 13:11:06.76634+00	2026-09-04 07:08:54.973197+00	wnsq66j2nk26	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	713	yavanzt7ynvf	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-08 07:17:20.286425+00	2026-09-08 08:54:37.634+00	r5kf47np5ood	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	664	qlkq4u3bwfuk	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-04 07:08:54.991625+00	2026-09-04 08:06:27.781101+00	phazxlxswsmb	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	657	hroyfgtupwbz	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-03 14:38:29.972822+00	2026-09-04 09:05:17.869112+00	zi6m6mlipb4u	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	763	eyv562klxm2g	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-09 13:40:18.703052+00	2026-09-09 14:38:13.159319+00	vibzhovhumqy	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	665	jeylsl4wfudu	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-04 08:06:27.795637+00	2026-09-04 11:12:49.303423+00	qlkq4u3bwfuk	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	723	sg32t6ttja74	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-08 12:07:06.361037+00	2026-09-08 13:06:21.693514+00	45dxu64md5r2	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	770	azfwvsumjl63	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-09 15:01:43.274753+00	2026-09-09 16:03:59.201379+00	b7zuk7tzxf5j	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	773	gqoxmrvmcgoc	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-09 16:03:59.208864+00	2026-09-09 17:01:48.72157+00	azfwvsumjl63	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	774	ngxwdgh6mi7l	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-09 17:01:48.735151+00	2026-09-10 04:43:21.60163+00	gqoxmrvmcgoc	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	661	konn2ygr5s4e	9f85d70f-f03b-4b59-a65a-a333889c66f7	t	2026-09-04 05:36:10.388675+00	2026-09-10 04:58:40.244975+00	46vxquni5b3r	dad185aa-fcd1-4a89-82bf-4a74f787e900
00000000-0000-0000-0000-000000000000	776	5zuw5gho6eql	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-10 04:36:00.745428+00	2026-09-10 05:33:38.27492+00	7hyzeepm5vmb	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	777	l5vkyhqnxqka	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 04:43:21.606609+00	2026-09-10 06:09:53.498226+00	ngxwdgh6mi7l	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	771	3tayh2uxgp75	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-09 15:06:06.155532+00	2026-09-10 06:56:03.62949+00	64bi4ic4frko	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	781	htyafi7ehuo6	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 06:09:53.505216+00	2026-09-10 07:07:49.504886+00	l5vkyhqnxqka	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	780	6faczbat27m5	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-10 05:33:38.29211+00	2026-09-10 07:22:50.115644+00	5zuw5gho6eql	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	783	k5zwfkvybbbh	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-10 07:04:35.204325+00	2026-09-10 08:02:35.450553+00	upod2xf3m6a4	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	784	aeds2dbpxlbi	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 07:07:49.510204+00	2026-09-10 08:05:28.136488+00	htyafi7ehuo6	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	782	bgo4gesno7pt	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-10 06:56:03.645809+00	2026-09-10 08:10:22.688668+00	3tayh2uxgp75	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	757	w32fscgaewo7	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-09 11:57:14.087419+00	2026-09-10 08:55:40.050719+00	\N	335386bb-2f02-4de8-9b90-07f410e13cca
00000000-0000-0000-0000-000000000000	772	mrtxtnobmsv2	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-09 15:43:04.430707+00	2026-09-10 08:56:03.438486+00	7fl3nstusbyq	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	751	lc3qhrqh22rp	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	t	2026-09-09 08:59:47.958485+00	2026-09-11 06:15:17.871938+00	rv3ffctqk2lh	f886c738-78ea-4de5-802a-0b4630a19e95
00000000-0000-0000-0000-000000000000	826	mr37adfssg7d	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-11 05:51:14.846526+00	2026-09-11 06:51:04.690256+00	ngnhvdrivj4z	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	811	thxqdpeynb2y	0ca4b72d-2641-4386-9b06-59df818bda02	t	2026-09-10 12:20:30.654663+00	2026-09-11 07:12:17.030308+00	reszu7yrtv3v	bcbc73f5-5c33-4a51-948c-59e0938d8935
00000000-0000-0000-0000-000000000000	829	voxdteievzlx	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-11 06:36:19.927143+00	2026-09-11 07:33:55.676413+00	hs5semcnohhh	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	804	drv43wge4wun	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-10 09:44:25.610024+00	2026-09-11 07:49:29.721619+00	r2xfb27e7xcj	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	797	gh2txhqwzavj	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-10 08:55:40.062536+00	2026-09-11 08:01:40.797531+00	w32fscgaewo7	335386bb-2f02-4de8-9b90-07f410e13cca
00000000-0000-0000-0000-000000000000	785	ad3kbq7yljdt	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-10 07:22:50.131957+00	2026-09-10 08:20:39.061116+00	6faczbat27m5	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	786	fj3ykcjkcnk2	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-10 07:23:43.693668+00	2026-09-10 08:21:37.452295+00	7nh5ddsq7mah	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	835	bj4yh6txpyh3	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-11 07:49:29.729534+00	2026-09-11 08:55:53.380591+00	drv43wge4wun	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	787	tzj3zbus72zj	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-10 08:02:35.463582+00	2026-09-10 09:00:35.415918+00	k5zwfkvybbbh	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	788	6inomrewnxlf	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 08:05:28.151528+00	2026-09-10 09:03:58.255053+00	aeds2dbpxlbi	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	825	hrajb5wosrns	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-11 05:45:11.927693+00	2026-09-11 11:35:54.471377+00	jp5uy2hyvwni	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	789	qts6pfpya7ul	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-10 08:10:22.697966+00	2026-09-10 09:10:55.193819+00	bgo4gesno7pt	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	814	is473bboqb22	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-10 14:14:38.125542+00	2026-09-11 14:18:21.783964+00	brzjjr3opl3q	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	791	dij5jhh3ycif	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-10 08:20:39.072913+00	2026-09-10 09:18:13.455011+00	ad3kbq7yljdt	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	845	i2mlyc2itbjg	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-11 08:55:53.387243+00	2026-09-11 15:50:16.685714+00	bj4yh6txpyh3	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	790	ldrzzb5lmeti	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	t	2026-09-10 08:15:20.179543+00	2026-09-10 09:40:19.71679+00	2qzu73ionjgh	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	803	o6xdcgni636l	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	f	2026-09-10 09:40:19.736281+00	2026-09-10 09:40:19.736281+00	ldrzzb5lmeti	c11a805a-0f3e-4dfc-9255-30f462154e44
00000000-0000-0000-0000-000000000000	792	r2xfb27e7xcj	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	t	2026-09-10 08:21:37.462209+00	2026-09-10 09:44:25.602864+00	fj3ykcjkcnk2	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	798	t6qw6i4qw77m	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-10 08:56:03.439009+00	2026-09-10 09:57:13.578635+00	mrtxtnobmsv2	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	800	glww6micxfm4	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 09:03:58.261709+00	2026-09-10 10:01:45.123952+00	6inomrewnxlf	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	807	tjh7nygmjgxy	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 10:01:45.13507+00	2026-09-10 11:32:34.072374+00	glww6micxfm4	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	805	ixrnvgjnfdbz	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-10 09:57:13.586395+00	2026-09-10 11:54:28.776185+00	t6qw6i4qw77m	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	808	h7lbb6k6g3pp	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 11:32:34.094003+00	2026-09-10 12:30:33.836775+00	tjh7nygmjgxy	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	801	pr3agca6tc6w	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-10 09:10:55.199579+00	2026-09-10 13:50:01.976841+00	qts6pfpya7ul	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	810	brzjjr3opl3q	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-10 11:54:28.786994+00	2026-09-10 14:14:38.114356+00	ixrnvgjnfdbz	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	812	xultjqiibd24	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 12:30:33.843057+00	2026-09-10 14:21:37.029849+00	h7lbb6k6g3pp	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	802	nesncrk47aqz	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-10 09:18:13.460758+00	2026-09-10 15:11:52.372422+00	dij5jhh3ycif	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	813	ri6zoqfdm3w6	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-10 13:50:01.994641+00	2026-09-10 15:17:51.600057+00	pr3agca6tc6w	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	817	apvuvekn64lh	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 14:21:37.031276+00	2026-09-10 15:43:11.974364+00	xultjqiibd24	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	816	stsb32fysgae	a8602130-044c-4c55-b726-9f4adaeb8f00	t	2026-09-10 14:21:34.640888+00	2026-09-10 15:49:41.151944+00	\N	ed64cbbf-8937-42b2-a4e7-4eb201be652d
00000000-0000-0000-0000-000000000000	821	53mzzccvuwvb	a8602130-044c-4c55-b726-9f4adaeb8f00	f	2026-09-10 15:49:41.156999+00	2026-09-10 15:49:41.156999+00	stsb32fysgae	ed64cbbf-8937-42b2-a4e7-4eb201be652d
00000000-0000-0000-0000-000000000000	820	qnto4gqazz2a	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 15:43:11.982138+00	2026-09-10 17:12:27.983726+00	apvuvekn64lh	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	818	ttab53jyf3uy	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-10 15:11:52.386299+00	2026-09-11 05:30:09.354752+00	nesncrk47aqz	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	822	jp5uy2hyvwni	2407b7ed-f057-4b44-842f-7026dce4f5eb	t	2026-09-10 17:12:28.000555+00	2026-09-11 05:45:11.918451+00	qnto4gqazz2a	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	819	ngnhvdrivj4z	13280cb3-abfb-42c1-982f-514715a026ca	t	2026-09-10 15:17:51.61083+00	2026-09-11 05:51:14.834794+00	ri6zoqfdm3w6	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	828	pdfqoiek7imd	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	f	2026-09-11 06:15:17.885241+00	2026-09-11 06:15:17.885241+00	lc3qhrqh22rp	f886c738-78ea-4de5-802a-0b4630a19e95
00000000-0000-0000-0000-000000000000	799	hs5semcnohhh	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-10 09:00:35.423302+00	2026-09-11 06:36:19.918575+00	tzj3zbus72zj	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	824	wn5cjuxcqqm4	7caffb15-3aa0-4304-a043-6b992628741c	t	2026-09-11 05:30:09.372303+00	2026-09-11 06:36:45.281621+00	ttab53jyf3uy	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	830	jdallipi5uoa	7caffb15-3aa0-4304-a043-6b992628741c	f	2026-09-11 06:36:45.282315+00	2026-09-11 06:36:45.282315+00	wn5cjuxcqqm4	ea47cf40-71aa-439d-97ba-feae805c7582
00000000-0000-0000-0000-000000000000	778	cf7qhl2ahcdz	9f85d70f-f03b-4b59-a65a-a333889c66f7	t	2026-09-10 04:58:40.252702+00	2026-09-11 09:54:56.267948+00	konn2ygr5s4e	dad185aa-fcd1-4a89-82bf-4a74f787e900
00000000-0000-0000-0000-000000000000	848	apok6w2xu3bz	62e22fdb-05bf-4bfb-9e6a-74424ef46541	t	2026-09-11 09:28:56.302345+00	2026-09-11 10:26:25.817651+00	2yk4r7ix3nzt	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	856	wwc7uisga7yk	62e22fdb-05bf-4bfb-9e6a-74424ef46541	f	2026-09-11 10:26:25.828911+00	2026-09-11 10:26:25.828911+00	apok6w2xu3bz	6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1
00000000-0000-0000-0000-000000000000	857	w2vjs2ax2bbw	2407b7ed-f057-4b44-842f-7026dce4f5eb	f	2026-09-11 11:35:54.486129+00	2026-09-11 11:35:54.486129+00	hrajb5wosrns	cfaf06d8-b01f-41e0-ab62-4190e9b72afa
00000000-0000-0000-0000-000000000000	853	jnzrd4lr3ogr	9f85d70f-f03b-4b59-a65a-a333889c66f7	t	2026-09-11 09:54:56.27839+00	2026-09-11 12:26:34.954648+00	cf7qhl2ahcdz	dad185aa-fcd1-4a89-82bf-4a74f787e900
00000000-0000-0000-0000-000000000000	863	tidijcxkbi3w	9f85d70f-f03b-4b59-a65a-a333889c66f7	f	2026-09-11 12:26:34.975239+00	2026-09-11 12:26:34.975239+00	jnzrd4lr3ogr	dad185aa-fcd1-4a89-82bf-4a74f787e900
00000000-0000-0000-0000-000000000000	865	c2qqfu3wxv2r	13280cb3-abfb-42c1-982f-514715a026ca	f	2026-09-11 13:46:04.362683+00	2026-09-11 13:46:04.362683+00	kv655mdjc6a6	335386bb-2f02-4de8-9b90-07f410e13cca
00000000-0000-0000-0000-000000000000	867	jjxwgcmsh4xm	13280cb3-abfb-42c1-982f-514715a026ca	f	2026-09-11 13:52:24.187235+00	2026-09-11 13:52:24.187235+00	73ndjrymsyb4	cd1e89ea-a366-41ec-b94d-6d6568c36ff1
00000000-0000-0000-0000-000000000000	868	jdztstsug2ko	0168f0de-46a5-4912-bad1-d4b3205f6384	f	2026-09-11 13:54:49.24803+00	2026-09-11 13:54:49.24803+00	\N	32dabb90-7594-4ec2-a522-be42f33355d6
00000000-0000-0000-0000-000000000000	869	thyticlcecgv	0168f0de-46a5-4912-bad1-d4b3205f6384	f	2026-09-11 14:10:09.749924+00	2026-09-11 14:10:09.749924+00	\N	4655c579-8b9d-4cbd-8023-6b21609a74ff
00000000-0000-0000-0000-000000000000	870	kflsgoijb437	0168f0de-46a5-4912-bad1-d4b3205f6384	f	2026-09-11 14:17:49.36157+00	2026-09-11 14:17:49.36157+00	\N	dcebb9e5-f757-420c-a828-bda6f3bdaab9
00000000-0000-0000-0000-000000000000	872	trcpkiaqtl6h	0168f0de-46a5-4912-bad1-d4b3205f6384	f	2026-09-11 14:25:59.126322+00	2026-09-11 14:25:59.126322+00	\N	66e8d009-5a7d-4a13-b527-a69d02278e37
00000000-0000-0000-0000-000000000000	871	heuqe7zyxrch	3ed8babd-c316-4dd4-b511-2ac6f098cbef	t	2026-09-11 14:18:21.788893+00	2026-09-11 15:16:21.136929+00	is473bboqb22	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	873	piyjyt5bctdx	3ed8babd-c316-4dd4-b511-2ac6f098cbef	f	2026-09-11 15:16:21.15095+00	2026-09-11 15:16:21.15095+00	heuqe7zyxrch	738f14fc-e824-4b35-a923-7bf0ada8ad9b
00000000-0000-0000-0000-000000000000	874	gvub2mdlkg6a	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	f	2026-09-11 15:50:16.697314+00	2026-09-11 15:50:16.697314+00	i2mlyc2itbjg	b8ae3fe6-41ef-4aab-9e38-b2a80941e035
00000000-0000-0000-0000-000000000000	875	u4ivzwreid2y	0168f0de-46a5-4912-bad1-d4b3205f6384	f	2026-09-11 17:04:32.184782+00	2026-09-11 17:04:32.184782+00	\N	510f7565-88d3-4b15-8ccb-c37f9b28aa5f
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
a5a32025-ba8e-43e3-b620-1db522931e60	c4aa0201-db24-4468-b0f6-f5fc6df0d095	2026-07-24 09:03:52.219861+00	2026-07-24 09:03:52.219861+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	90.104.16.111	\N	\N	\N	\N	\N
cfaf06d8-b01f-41e0-ab62-4190e9b72afa	2407b7ed-f057-4b44-842f-7026dce4f5eb	2026-07-27 15:21:22.556052+00	2026-09-11 11:35:54.513196+00	\N	aal1	\N	2026-09-11 11:35:54.513085	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	92.174.88.217	\N	\N	\N	\N	\N
a02b248d-ddd3-492f-9891-3b817ab77ac3	c4aa0201-db24-4468-b0f6-f5fc6df0d095	2026-07-24 09:02:23.993553+00	2026-07-24 11:31:16.91935+00	\N	aal1	\N	2026-07-24 11:31:16.919238	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	90.104.16.111	\N	\N	\N	\N	\N
bcbc73f5-5c33-4a51-948c-59e0938d8935	0ca4b72d-2641-4386-9b06-59df818bda02	2026-07-30 12:56:51.422422+00	2026-09-11 07:12:17.06759+00	\N	aal1	\N	2026-09-11 07:12:17.067513	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
335386bb-2f02-4de8-9b90-07f410e13cca	13280cb3-abfb-42c1-982f-514715a026ca	2026-09-09 11:57:14.079843+00	2026-09-11 13:46:04.389269+00	\N	aal1	\N	2026-09-11 13:46:04.389188	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1	92.184.144.175	\N	\N	\N	\N	\N
ed64cbbf-8937-42b2-a4e7-4eb201be652d	a8602130-044c-4c55-b726-9f4adaeb8f00	2026-09-10 14:21:34.629043+00	2026-09-10 15:49:41.177921+00	\N	aal1	\N	2026-09-10 15:49:41.177842	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	82.127.212.114	\N	\N	\N	\N	\N
6a0ef059-e18b-4fc3-aa68-e2deeaf6c2e1	62e22fdb-05bf-4bfb-9e6a-74424ef46541	2026-07-24 14:08:15.059664+00	2026-09-11 10:26:25.847279+00	\N	aal1	\N	2026-09-11 10:26:25.84719	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
cd1e89ea-a366-41ec-b94d-6d6568c36ff1	13280cb3-abfb-42c1-982f-514715a026ca	2026-08-06 08:36:22.427451+00	2026-09-11 13:52:24.191178+00	\N	aal1	\N	2026-09-11 13:52:24.191033	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
ea47cf40-71aa-439d-97ba-feae805c7582	7caffb15-3aa0-4304-a043-6b992628741c	2026-09-07 08:12:24.999301+00	2026-09-11 06:36:45.284595+00	\N	aal1	\N	2026-09-11 06:36:45.284506	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
c11a805a-0f3e-4dfc-9255-30f462154e44	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	2026-07-24 09:47:52.994104+00	2026-09-10 09:40:19.755574+00	\N	aal1	\N	2026-09-10 09:40:19.75548	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
f886c738-78ea-4de5-802a-0b4630a19e95	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	2026-09-08 06:25:08.155618+00	2026-09-11 06:15:17.902132+00	\N	aal1	\N	2026-09-11 06:15:17.902054	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	92.174.88.217	\N	\N	\N	\N	\N
d6c96e11-8e19-4b70-8998-a330829ca2d2	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	2026-07-24 09:13:29.459824+00	2026-07-28 06:53:07.268032+00	\N	aal1	\N	2026-07-28 06:53:07.267859	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	92.174.88.217	\N	\N	\N	\N	\N
5cb735bd-fea1-4977-8b28-8657ee63ef1c	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	2026-08-03 13:46:57.506477+00	2026-08-04 07:17:28.139011+00	\N	aal1	\N	2026-08-04 07:17:28.138912	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	92.174.88.217	\N	\N	\N	\N	\N
3bdb60c0-a48b-4d12-9fa8-3401efaaee9b	a8602130-044c-4c55-b726-9f4adaeb8f00	2026-09-01 12:20:40.61345+00	2026-09-01 13:18:49.772553+00	\N	aal1	\N	2026-09-01 13:18:49.772426	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	82.127.212.114	\N	\N	\N	\N	\N
dad185aa-fcd1-4a89-82bf-4a74f787e900	9f85d70f-f03b-4b59-a65a-a333889c66f7	2026-09-01 12:27:42.162762+00	2026-09-11 12:26:34.999959+00	\N	aal1	\N	2026-09-11 12:26:34.999848	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	82.127.212.114	\N	\N	\N	\N	\N
23ec3c60-aaa3-4ed7-8b63-eacce53d6fc5	2407b7ed-f057-4b44-842f-7026dce4f5eb	2026-07-27 14:57:04.755223+00	2026-07-28 19:27:43.483619+00	\N	aal1	\N	2026-07-28 19:27:43.483514	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	92.184.97.27	\N	\N	\N	\N	\N
738f14fc-e824-4b35-a923-7bf0ada8ad9b	3ed8babd-c316-4dd4-b511-2ac6f098cbef	2026-07-24 15:10:46.859551+00	2026-09-11 15:16:21.183994+00	\N	aal1	\N	2026-09-11 15:16:21.183918	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
e54053fd-da5f-412d-8601-bb423e259060	3ed8babd-c316-4dd4-b511-2ac6f098cbef	2026-07-28 05:24:17.997606+00	2026-07-28 05:24:17.997606+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	90.27.128.68	\N	\N	\N	\N	\N
7e1bb40f-d38d-43db-861e-3e8bed95e19a	13280cb3-abfb-42c1-982f-514715a026ca	2026-08-03 13:30:00.070306+00	2026-08-06 08:36:21.857373+00	\N	aal1	\N	2026-08-06 08:36:21.857261	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	82.127.212.114	\N	\N	\N	\N	\N
0ff26c47-2534-472f-84c5-a42cf7b08901	13280cb3-abfb-42c1-982f-514715a026ca	2026-07-30 05:59:58.525176+00	2026-07-30 13:58:04.967388+00	\N	aal1	\N	2026-07-30 13:58:04.967299	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	92.184.140.129	\N	\N	\N	\N	\N
aa15351e-6c70-4a1c-be1f-c433fd945632	13280cb3-abfb-42c1-982f-514715a026ca	2026-07-27 14:11:14.682886+00	2026-08-03 13:29:59.536039+00	\N	aal1	\N	2026-08-03 13:29:59.535936	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	82.127.212.114	\N	\N	\N	\N	\N
b8ae3fe6-41ef-4aab-9e38-b2a80941e035	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	2026-07-24 15:30:55.651902+00	2026-09-11 15:50:16.719735+00	\N	aal1	\N	2026-09-11 15:50:16.719658	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
32dabb90-7594-4ec2-a522-be42f33355d6	0168f0de-46a5-4912-bad1-d4b3205f6384	2026-09-11 13:54:49.239465+00	2026-09-11 13:54:49.239465+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
4655c579-8b9d-4cbd-8023-6b21609a74ff	0168f0de-46a5-4912-bad1-d4b3205f6384	2026-09-11 14:10:09.745608+00	2026-09-11 14:10:09.745608+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
dcebb9e5-f757-420c-a828-bda6f3bdaab9	0168f0de-46a5-4912-bad1-d4b3205f6384	2026-09-11 14:17:49.357401+00	2026-09-11 14:17:49.357401+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
66e8d009-5a7d-4a13-b527-a69d02278e37	0168f0de-46a5-4912-bad1-d4b3205f6384	2026-09-11 14:25:59.115829+00	2026-09-11 14:25:59.115829+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	92.174.88.217	\N	\N	\N	\N	\N
510f7565-88d3-4b15-8ccb-c37f9b28aa5f	0168f0de-46a5-4912-bad1-d4b3205f6384	2026-09-11 17:04:32.143998+00	2026-09-11 17:04:32.143998+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	90.19.48.228	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	c4aa0201-db24-4468-b0f6-f5fc6df0d095	authenticated	authenticated	batiment@noree.fr	$2a$06$6l/QJvTzUKzwwU7hD7ZSoeyMEjcwpQEsORGd3YItdw.lLInxzGtUW	2026-07-24 09:00:24.211763+00	\N		\N		2026-07-24 09:00:24.211763+00			\N	2026-07-24 09:03:52.21922+00	{"provider": "email", "providers": ["email"]}	{"nom": "Célia", "role": "lecture"}	\N	2026-07-24 09:00:24.211763+00	2026-07-24 11:31:16.897995+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	62e22fdb-05bf-4bfb-9e6a-74424ef46541	authenticated	authenticated	p.carmard@noree.fr	$2a$06$5kiD6ftLKr04qj0on69ZfO/DMfA.7NeWNKULW734xN.oJ4eIKowHW	2026-07-24 14:04:37.217215+00	\N		\N		2026-07-24 14:04:37.217215+00			\N	2026-07-24 14:08:15.057134+00	{"provider": "email", "providers": ["email"]}	{"nom": "Philippe", "role": "lecture"}	\N	2026-07-24 14:04:37.217215+00	2026-09-11 10:26:25.83189+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2407b7ed-f057-4b44-842f-7026dce4f5eb	authenticated	authenticated	r.leherisse@noree.fr	$2a$06$zpWflszLXd0gnNj7GTCf6uJHDkB/cFCZAtkGeSo.1VGBs/9vNQvmO	2026-07-24 08:52:30.176933+00	\N		\N		2026-07-24 08:52:30.176933+00			\N	2026-07-27 15:21:22.555307+00	{"provider": "email", "providers": ["email"]}	{"nom": "Romain", "role": "lecture"}	\N	2026-07-24 08:52:30.176933+00	2026-09-11 11:35:54.497241+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	13280cb3-abfb-42c1-982f-514715a026ca	authenticated	authenticated	y.tassel@couvran.com	$2a$06$0iAcGsFRWczVSzwemNlF5OTn85SVjufeIGMrg4srJyB68IA7Vc5R6	2026-07-27 14:08:19.443153+00	\N		\N		2026-07-27 14:08:19.443153+00			\N	2026-09-09 11:57:14.077828+00	{"provider": "email", "providers": ["email"]}	{"nom": "Yoann", "role": "planning"}	\N	2026-07-27 14:08:19.443153+00	2026-09-11 13:52:24.188391+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9f85d70f-f03b-4b59-a65a-a333889c66f7	authenticated	authenticated	contact@couvran.com	$2a$06$Yr6/rnumvB/Lh02wSiznr.S71rR4MpX8Hr7lY0/qQwFsMYBQwj16C	2026-09-01 12:27:42.154766+00	2026-09-01 12:22:23.446428+00		\N		\N			\N	2026-09-01 12:27:42.162638+00	{"provider": "email", "providers": ["email"]}	{"nom": "Stephane", "role": "lecture", "email_verified": true}	\N	2026-09-01 12:22:23.424641+00	2026-09-11 12:26:34.982873+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3ed8babd-c316-4dd4-b511-2ac6f098cbef	authenticated	authenticated	csoyer@noree.fr	$2a$06$i/OpdIDkw2G/XcboEOKRyOm1Qrb3OBjPYEHofvzsinGkjzAQpedj.	2026-07-24 09:29:37.693755+00	\N		\N		2026-07-24 09:29:37.693755+00			\N	2026-07-28 05:24:17.996085+00	{"provider": "email", "providers": ["email"]}	{"nom": "Cyril", "role": "admin"}	\N	2026-07-24 09:29:37.693755+00	2026-09-11 15:16:21.162657+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	authenticated	authenticated	j.basset@noree.fr	$2a$06$YsDRiRt6dduKbzxWgdziD.0hmShsGnnxCayHNY8u0tOIvSMZBKHEi	2026-07-24 13:52:43.435223+00	\N		\N		2026-07-24 13:52:43.435223+00			\N	2026-07-24 15:30:55.651178+00	{"provider": "email", "providers": ["email"]}	{"nom": "Johan", "role": "lecture"}	\N	2026-07-24 13:52:43.435223+00	2026-09-11 15:50:16.701432+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0168f0de-46a5-4912-bad1-d4b3205f6384	authenticated	authenticated	t.corlay@noree.fr	$2a$06$3ojkrFN20jIogqn3d0FWYOEpiVq6h3cydIcSfhO/jsG6qHBrgc1Qe	2026-07-23 14:03:09.219251+00	\N		\N		2026-08-06 16:27:58.203727+00			\N	2026-09-11 17:04:32.143336+00	{"provider": "email", "providers": ["email"]}	{"nom": "Tom", "role": "admin"}	\N	2026-07-23 14:03:09.219251+00	2026-09-11 17:04:32.214266+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a8602130-044c-4c55-b726-9f4adaeb8f00	authenticated	authenticated	admin@couvran.com	$2a$06$NQPv3kyEDEka8twK7n.FheKAAfimLu3qsjSmQLM6TO8aG6Z.D2Hg.	2026-09-01 12:20:40.606236+00	2026-09-01 11:58:07.505378+00		\N		\N			\N	2026-09-10 14:21:34.628909+00	{"provider": "email", "providers": ["email"]}	{"nom": "Eloise", "role": "lecture", "email_verified": true}	\N	2026-09-01 11:58:07.475339+00	2026-09-10 15:49:41.160116+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7bdbaabe-619a-43d1-bac5-27643379bfa7	authenticated	authenticated	tcorlay03@gmail.com	$2a$06$p5cctqbQS0rboWIUu.2J7.FVMzNRDsD7kQaGUquVpa1vyT6UdPmKa	2026-09-09 12:58:39.532445+00	2026-09-09 12:58:29.332698+00		\N		\N			\N	2026-09-09 12:58:39.540954+00	{"provider": "email", "providers": ["email"]}	{"nom": "tom", "role": "lecture", "email_verified": true}	\N	2026-09-09 12:58:29.302573+00	2026-09-09 13:58:48.473137+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0ca4b72d-2641-4386-9b06-59df818bda02	authenticated	authenticated	f.dayot@noree.fr	$2a$06$G1YLtVQrsdBmcH8cHY0Yvu4kGf50T8UTfrgZr9UmAFjIfGCrHRc1m	2026-07-30 12:55:49.516449+00	\N		\N		2026-07-30 12:55:49.516449+00			\N	2026-07-30 12:56:51.421218+00	{"provider": "email", "providers": ["email"]}	{"nom": "Fabrice", "role": "planning"}	\N	2026-07-30 12:55:49.516449+00	2026-09-11 07:12:17.047391+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	authenticated	authenticated	s.poirier@noree.fr	$2a$06$7K47DrAEYSXSZbx3C3UzW.zH2QA8wJfAVTirtocTX5sR4sJ5yUnLi	2026-07-24 08:49:44.03091+00	\N		\N		2026-07-24 08:49:44.03091+00			\N	2026-07-24 09:47:52.993388+00	{"provider": "email", "providers": ["email"]}	{"nom": "Simon", "role": "lecture"}	\N	2026-07-24 08:49:44.03091+00	2026-09-10 09:40:19.746472+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4b28001a-bb0c-416a-9e59-d2f39d65f2fe	authenticated	authenticated	devis@noree.fr	$2a$06$uMIdmtEs7ByTKuQtncX5cO7cRFg8.MFI5RjJn1dPARS9HmFrsUjom	2026-07-24 08:47:59.472615+00	\N		\N		2026-07-24 08:47:59.472615+00			\N	2026-09-08 06:25:08.153888+00	{"provider": "email", "providers": ["email"]}	{"nom": "Marie", "role": "planning"}	\N	2026-07-24 08:47:59.472615+00	2026-09-11 06:15:17.887564+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7caffb15-3aa0-4304-a043-6b992628741c	authenticated	authenticated	j.courtel@noree.fr	$2a$06$LLQio0b3C.GIq8X78BEHWO2LxlbRAvkUSd3QjNQlyaBU1WaS6izoG	2026-07-24 09:25:16.796998+00	\N		\N		2026-07-24 09:25:16.796998+00			\N	2026-09-07 08:12:24.997915+00	{"provider": "email", "providers": ["email"]}	{"nom": "Simon", "role": "lecture"}	\N	2026-07-24 09:25:16.796998+00	2026-09-11 06:36:45.283277+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: chantiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chantiers (id, company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked, detail, force_aout, montant_devis, client_nom, client_adresse, client_telephone, numero_chantier, "vendeurId", "typeChantierId") FROM stdin;
12977	couvran	1221	2027-02-16	28	LE CANUT ENERGIE	9903	#ccffcc	EARL LE CANUT\n\nVILLENEUVE\n\n35380 PLELAN LE GRAND\n\nCH260114 PAR FD	0	0		f	0					0	0
12976	couvran	1221	2027-01-07	28	GAUTRAIS	17900	#ccffcc	EARL DES GAUTRAIS \n\n1 les gautrais \n\n22130 CORSEUL \n\n06 64 96 59 69 \n\n\n\nD 052606405 YT	0	0		f	0					0	0
12158	couvran	1219	2026-09-28	18	LES VAUX ROUSSIN	17900	#ccffcc	Gaec les vaux roussins \n\nSylvain POISSON\n\n22150 Plemy \n\n06 03 94 61 29	0	0		f	0					0	0
12090	couvran	1220	2026-10-14	80	COLONIE	9905	#ccffcc	GAEC DE LA COLONIE\n\nLA COLONIE\n\n22640 PLESTAN\n\n260207 PC	0	0	STABULE	f	0					0	0
12972	couvran	1221	2026-12-09	3	PRE FONTAINE	9904	#ccffcc	HAMEON VINCENT \n\nLES AULNAIS \n\n22250 BROONS \n\n06 78 54 24 76 	0	0		f	0					0	0
12992	couvran	1216	2026-10-20	5	KEROUZE	14340	#eab308	SARL DE KEROUZE\n\nJOEL RIBOT\n\n20 KEROUZE\n\n22170 BRINGOLO\n\nCH 260607 PAR PC\n\n	0	0	Ø16HT4	f	0					0	0
12096	couvran	1222	2026-10-16	14	GRAND BERCON	9904	#eab308	GAEC DU GRAND BERCON\n\nLE GRAND BERCON\n\n72130 MONTREUIL LE CHETIF\n\n06 45 85 07 57\n\nCH 250204 PAR PC\n\n	0	0	Ø31HT4	f	0					0	0
13958	couvran	1216	2026-10-29	5	CLOS PERRIN	9904	#eab308	GAEC CLOS PERRIN\n\nLES MOUSTIERS\n\n56380 GUER \n\n260603 PAR PC	0	0	Ø35.7HT4	f	0					0	0
14026	couvran	1221	2026-11-18	15	KERYVONNOU	17900	#ffff99	EARL KERYVONNOU \nMELGVEN 29146 \n06 99 29 69 89 \n\nCA : 42 723.45€\n	0	0	Rénovation (dallage; mur de fosse ; poteau ; poutre ; caillebotis) 	f	0					0	0
13291	rat	1230	2026-09-01	107	DEBREE	14340	#ccffcc	MR DEBREE\n\nLD CRUG LANN\n\n22810 BELLE ISLE EN TERRE\n\nTERRASSEMENT        41 913 €\n\nDEMOLITION             41 251 €\n\nRESEAUX                      4 949 €\n\nRDC                         114 444  €\n\nPLANCHER HT           15 017 €\n\nR+1                              5 279 €\n\nTOITURE                        7588 €\n\nDIVERS OUVRAGES    42 000 €	0	0	BELLE ISLE EN TERRE	f	0					0	0
13285	rat	1258	2027-01-07	40	COQUENO	9903	#ccffcc		0	0		f	0					0	0
13875	rat	1227	2026-12-08	15	TERMET 	14340	#ccffff		0	0		f	0					0	0
14022	rat	-1	2026-09-14	1	ruminy	9903	#ccffcc		0	0		f	0					0	0
14023	rat	1229	2026-09-17	2	mokilou	9903	#73f573		0	0		f	0					0	0
13889	noree	1252	2027-02-16	29	KERTANGUY	14340	#73f573	EARL KERTANGUY\nKERTANGUY\n29190 PLOGONNEC\n260901 PAR CS	0	0	Ø32HT8	f	0					0	0
9969	noree	1246	2026-11-16	13	ECOVAL	9904	#a9acb2		0	0	Ø22 HT6	f	0					0	0
10914	noree	1247	2026-10-29	77	BENARDIER	9906	#ffff99	SCEA LA BENARDIERE\n\nLAURENT DARTOIS\n\nLA BESNARDIERE\n\n22350 CAULNES\n\n250904 PAR CS\n\nengrais              307595 €	0	0		f	0					0	0
11617	noree	1251	2027-05-20	23	SAS des TERRIERS 	9903	#73f573	GAEC DE LA HERBRECHERE\n\n12 LA CROIX HAMEL\n\n50600 GRANDPARIGNY\n\n260307 PAR CS	0	0	Ø25HT8	f	0					0	0
9967	noree	1239	2026-12-08	13	METHA DOURIEU	9904	#a9acb2	METHA DU DOURIEU\n\nKERIDOUARD\n\n22580 PLOUHA\n\n260308 PAR PC	0	0	Ø20 HT6	f	0					0	0
11013	noree	1248	2027-05-31	25	MT NRJ	14340	#73f573	SAS MT NRJ\n\nPONT ER GUEL\n\n56420 PLAUDREN\n\nCH260608 PAR FD	0	0	Ø26 HT8	f	0					0	0
12970	couvran	1221	2026-08-24	5	LES VAUX ROUSSIN	17900	#ccffcc	Gaec les vaux roussins \n\nSylvain POISSON\n\n22150 Plemy \n\n06 03 94 61 29	0	0		f	0					0	0
12081	couvran	1216	2026-09-16	6	PICHARD TANGUY	9904	#ccffff	EARL PICHARD TANGUY\n\nKERLOUISE\n\n56580 CREDIN \n\n260309 PAR PC	0	0		f	0					0	0
13626	couvran	1219	2026-10-22	20	LESSARD 	17900	#ccffcc	Prix total : 75 769.10 €\nPrix terrassement : 5477.96 €	0	0	Pont bascule 	f	0					0	0
13294	rat	-14	2026-10-05	15	HAMON LANGAST	14340	#ccffcc		0	0		f	0					0	0
13292	rat	-1	2026-09-07	5	FERME ABBAYE	9905	#ffff99	GAEC FERME DE L ABBAYE\n\n4 Rue de l’Abbaye\n\n22350 Yvignac la Tour\n\n42000€ Ht	0	0		f	0					0	0
14009	rat	1227	2026-09-17	2	beau moelan 	9904	#a9a7a7		0	0		f	0					0	0
14029	rat	-14	2026-11-16	43	chretien alexi 	14340	#ee9a5d		0	0		f	0					0	0
13874	rat	1229	2026-10-19	30	LAURGEAU 	14340	#eab308		0	0		f	0					0	0
13529	noree	1245	2026-11-24	7	LE CANUT ENERGIE	9903	#73f573	LE CANUT ENERGIE\n\nVILLE NEUVE\n\n35380 PLELAN LE GRAND CH 26015\n\nPAR FD	0	0	Ø25HT8	f	0					0	0
13507	noree	-2	2026-09-28	12	CUMA YFFINIAC	9905	#ccffcc	CUMA YFFINIAC \n\nLE PONT RONTON\n\n22120 YFFINIAC\n\n260302 PAR CS	0	0		f	0					0	0
10135	noree	1248	2027-02-16	27	METHA DOURIEU	9904	#73f573	METHA DU DOURIEU\n\nKERIDOUARD\n\n22580 PLOUHA\n\n260308 PAR PC	0	0	Ø30HT8 LINER	f	0					0	0
11615	noree	1251	2027-04-05	25	METHAROCHER	9906	#73f573	SAS METHAROCHER\n\nLA GRANDE LOUVIERE\n\n35420 MONTHAULT\n\n260306 PAR CS	0	0	Ø25HT8	f	0					0	0
11018	noree	1249	2026-12-16	15	ROBERT	9903	#ffff99	ROBERT JEAN FRANCOIS\n\n22 PLANCOET	0	0		f	0					0	0
13637	noree	1254	2026-10-01	9	fdgsd	9903	#00b050		0	0		f	0					0	0
13506	noree	-2	2026-08-31	5	CUMA YFFINIAC	9905	#ccffcc	CUMA YFFINIAC \n\nLE PONT RONTON\n\n22120 YFFINIAC\n\n260302 PAR CS	0	0		f	14500	rzr	ezrz	rezer	erezr	4	18
13826	couvran	1223	2027-02-23	100	l'aisy	9903	#c00000		0	0		f	0					0	0
12094	couvran	1222	2026-09-17	11	BREKI	9906	#ccffff	SAS BREKKI ENERGIE\n\n3 Bis route de ste marguerite\n\n50290 BRICQUEVILLE / MER\n\nCH 230801 PAR CS	0	0	Ø36HT3	f	0					0	0
12080	couvran	1216	2026-09-07	7	BEDEL	9904	#ccffff	GAEC BEDEL\n\n1 LE GRAND PAGE\n\n22330 LANGOURLA\n\n06 20 99 35 21\n\nCH 241105 PAR FD	0	0	Ø27HT3	f	0					0	0
12083	couvran	1216	2026-09-28	2	PRE FONTAINE	9904	#eab308	HAMEON VINCENT \n\nLES AULNAIS \n\n22250 BROONS \n\n06 78 54 24 76 	0	0	Ø18HT4	f	0					0	0
12971	couvran	1215	2026-10-01	10	CRESPEL	17900	#ccffcc	ETA CRESPEL \n\nSAINT MAUDEZ , 22270 MEGRIT \n\n06 64 18 38 21 \n\nd 052601321 YT 	0	0		f	0					0	0
12991	couvran	1239	2027-03-22	14	DARTOIS	9906	#a9a7a7	SARL DARTOIS\n\nLE BEAU CHENE\n\n22350 GUITTE\n\nCH260504 PAR CS\n\n	0	0	Ø29.20HT6	f	0					0	0
10912	noree	1246	2027-07-08	5	LGP ENERGIE	9904	#eab308	SAS LGP ENERGIE\n\nM. PEURON\n\n213 KERLENAT\n\n56160 LOCMALO\n\n251201 PAR FD	0	0	Ø8HT4	f	0					0	0
10928	noree	1252	2026-09-18	24	LOEIZA	9906	#73f573	SAS LOEIZA\n\nKERREO\n\n56330 PLUVIGNER\n\n260404 PAR CS	0	0	Ø25Ht8	f	0					0	0
10921	noree	1248	2026-11-05	3	AMYL ENERGIES	9903	#73f573	SAS AMYL ENERGIES\n\nLD KERGOAT\n\n29400 SAINT SAUVEUR \n\n PAR CS	0	0	Ø30HT8	f	0					0	0
10156	noree	1246	2026-07-27	5	HENRIES	9905	#ccffff	GAEC L'HENRIES\n\nMRS ROUVRAY\n\nL'Henries\n\n56120 PLEUGRIFFET	0	0	Ø7HT3	f	0					0	0
13510	noree	-2	2026-10-14	5	BECHEREL	9903	#ee9a5d		0	0		f	0					0	0
10922	noree	1248	2026-10-30	4	AMYL ENERGIES	9903	#73f573	SAS AMYL ENERGIES\n\nLD KERGOAT\n\n29400 SAINT SAUVEUR \n\n PAR CS	0	0	Ø23HT8	f	0					0	0
10134	noree	1245	2026-06-10	97	LEFF ARMOR-TREGUIDEL	9906	#ee9a5d	LEFF ARMOR COMMUNAUTE\n\nSTEP TREGUIDEL\n\nCH 250402	0	0		f	0					0	0
13894	couvran	1216	2026-12-18	6	VAULTIER 	9904	#ccffff		0	0	FOSSE Ø21.00 ht 3.00 m 	f	0					0	0
13955	couvran	1216	2026-09-24	2	ARMOR PONDI	9904	#ccffff	GAEC ARMOR PONDI \n\nLA VILLE ES GICQUIAUX \n\n22130 LANGUENAN \n\n06 87 89 18 13 \n\n\nYT D 052604316	0	0	Ø15HT3	f	0					0	0
13956	couvran	1216	2026-10-15	3	PRE FONTAINE	9904	#eab308	HAMEON VINCENT \n\nLES AULNAIS \n\n22250 BROONS \n\n06 78 54 24 76 	0	0		f	0					0	0
13957	couvran	1216	2026-11-09	5	CLOS PERRIN	9904	#eab308	GAEC CLOS PERRIN\n\nLES MOUSTIERS\n\n56380 GUER \n\n260603 PAR PC	0	0	Ø35.7HT4	f	0					0	0
13584	couvran	1222	2027-09-01	83	silo bioret metha 	9906	#c00000		0	0		f	0					0	0
13857	couvran	1216	2027-03-24	25	sarl des ribines 	9903	#c00000		0	0		f	0					0	0
13827	couvran	1215	2027-04-08	50	hinault	9903	#c00000		0	0		f	0					0	0
12159	couvran	1221	2026-10-02	17	EARL DU GUI	17900	#ccffcc	ERWAN LE NEVE \n\n06 23 42 10 82 \n\nPASTEL DU GUY 56190 AMBON 	0	0		f	0					0	0
12157	couvran	1219	2026-09-23	3	REBINDAINE	17900	#ccffcc		0	0		f	0					0	0
13000	couvran	1220	2027-02-18	75	LE CANUT	9903	#ccffcc	EARL LE CANUT\n\nVILLENEUVE\n\n35380 PLELAN LE GRAND\n\nCH260114 PAR FD	0	0		f	0					0	0
12990	couvran	1239	2027-03-02	14	DARTOIS	9906	#a9a7a7	SARL DARTOIS\n\nLE BEAU CHENE\n\n22350 GUITTE\n\nCH260504 PAR CS\n\n	0	0	Ø29.20HT6	f	0					0	0
13658	rat	1227	2026-10-21	6	valette	9905	#ee9a5d		0	0		f	0					0	0
13655	rat	-1	2026-09-15	7	dartois dalle et semelles 	9906	#ccffcc		0	0		f	0					0	0
13283	rat	1227	2026-10-05	12	SODIAL PLANCHER	9903	#ee9a5d		0	0		f	0					0	0
9965	noree	1239	2026-10-13	6	METHANIROISE	9905	#ccffff	SAS METHANIROISE\n\nKELEVARS\n\n29810 PLOUMOGUER\n\nCH260401 PAR PC	0	0	Ø8HT3	f	0					0	0
10911	noree	1246	2027-05-31	28	LGP ENERGIE	9904	#73f573	SAS LGP ENERGIE\n\nM. PEURON\n\n213 KERLENAT\n\n56160 LOCMALO\n\n251201 PAR FD	0	0	Ø37HT8	f	0					0	0
10187	noree	1246	2026-11-09	4	ECOVAL	9904	#a9acb2	GAEC DES ROCHERS\n\nFABIEN TERTRAIS\n\n56380 ST MALO DE BEIGNON\n\nCH 240902 PAR FD\n\n	0	0		f	0					0	0
11616	noree	1251	2027-05-10	8	METHAROCHER	14340	#ccffff	SAS METHAROCHER\n\nLA GRANDE LOUVIERE\n\n35420 MONTHAULT\n\n260306 PAR CS	0	0	Ø7HT3	f	0					0	0
13869	noree	1239	2027-04-30	15	ropert	9906	#a9a7a7	SCEA AUFFRET Pierre Luc\n\nKerrivarch\n\n29 PLONEVEZ DU FAOU\n\n250707 PAR CS	0	0	Ø32HT6	f	0					0	0
13888	noree	1252	2027-01-12	25	KERTANGUY	14340	#73f573	EARL KERTANGUY\nKERTANGUY\n29190 PLOGONNEC\n260901 PAR CS	0	0	Ø25HT8	f	0					0	0
13890	noree	1253	2027-03-22	5	KERTANGUY	14340	#ee9a5d	EARL KERTANGUY\nKERTANGUY\n29190 PLOGONNEC\n260901 PAR CS	0	0	Ø7HT3	f	0					0	0
13891	noree	1253	2027-03-29	5	KERTANGUY	14340	#ee9a5d	EARL KERTANGUY\nKERTANGUY\n29190 PLOGONNEC\n260901 PAR CS	0	0	Ø7HT3	f	0					0	0
11631	noree	1248	2026-07-27	5	LC ENERGIE	9903	#73f573		0	0	Ø33HT8	f	0					0	0
11620	noree	1254	2027-08-24	20	FLORALE	14340	#73f573	SAS LA FLORALE\n\n44 GUEMENE PENFAO\n\n260602 PAR CS	0	0	Ø28HT8	f	0					0	0
11632	noree	1248	2026-06-30	18	LC ENERGIE	9903	#73f573		0	0	Ø33HT8	f	0					0	0
12998	couvran	1219	2027-01-12	5	PRAIRIE DE GEFFRAY	9906	#ccffcc	GAEC LES PRAIRIES DE GEFFRAY \n\nLe bodeux \n\n22600 SAINT MAUDAN \n\n06 74 88 64 82 \n\nlesprairiesdegeffray@gmail.com \n\n	0	0		f	0					0	0
13605	noree	1252	2026-08-27	16	TEST TOM	14340	#ccffcc		0	0	TEST	f	160000	Tom corlay	4 rue du verger	0786611440	dazd	2	17
13293	rat	-14	2026-09-14	15	PIERRU	14340	#eab308	PIERRU JULIEN\n\n1 La Ville Caradeuc\n\n22510 Trébry\n\n6592.94€ ttc	0	0	TREBRY	f	0					0	0
13290	rat	1229	2026-09-28	15	VERDIER 	17900	#ffff99	Mme Verdier\n\n30 Rue de L'épine Merlet\n\n22590 Pordic\n\n46119.92€  TTC TVA 20\n\n2574.00€ TTC TVA 10	0	0		f	0					0	0
13282	rat	1227	2026-09-21	10	VALLET	9905	#ee9a5d	MARTEAU - LNUF MARQUES\n\nUSINE DE VALLET\n\n44330 VALLET\n\nCH240803 PAR PN	0	0		f	0					0	0
13289	rat	1228	2027-01-08	29	LE VILLEUX ST RIEU	14340	#ccffff		0	0		f	0					0	0
13286	rat	1228	2026-09-23	5	CAILLLET	14340	#c00000		0	0		f	0					0	0
13002	rat	1227	2026-09-01	9	LOUIS DE BRETAGNE	14340	#2563eb		0	0		f	0					0	0
10910	noree	1246	2027-04-26	25	LGP ENERGIE	9904	#73f573	SAS LGP ENERGIE\n\nM. PEURON\n\n213 KERLENAT\n\n56160 LOCMALO\n\n251201 PAR FD	0	0	Ø26HT8	f	0					0	0
10273	noree	1245	2027-03-30	4	LE CANUT ENERGIE	14340	#ccffff	LE CANUT ENERGIE\n\nVILLE NEUVE\n\n35380 PLELAN LE GRAND CH 26015\n\nPAR FD	0	0	Ø7HT3	f	0					0	0
10277	noree	1239	2026-11-30	6	AUFFRET	9903	#eab308	SCEA AUFFRET Pierre Luc\n\nKerrivarch\n\n29 PLONEVEZ DU FAOU\n\n250707 PAR CS	0	0	Ø8HT4	f	0					0	0
13703	noree	1247	2027-04-01	110	beau chêne 	9906	#c00000		0	0		f	0					0	0
10126	noree	1239	2027-02-25	3	ECOVAL	9904	#ccffff		0	0	Ø7 HT3	f	0					0	0
11614	noree	1251	2027-03-02	24	METHAROCHER	9906	#73f573	SAS METHAROCHER\n\nLA GRANDE LOUVIERE\n\n35420 MONTHAULT\n\n260306 PAR CS	0	0	Ø25HT8	f	0					0	0
13527	noree	-2	2026-11-09	74	GUERLESQUIN	9905	#ee9a5d	GUERLESQUIN\n\nPIERRE	0	0		f	0					0	0
11633	noree	1249	2026-07-13	26	VALLEE GAZ	9904	#ccffcc	SARL VALLEE GAZ\n\nTHEO CARFANTAN\n\nLA VALLEE\n\n22400 QUINTIN	0	0	SILO	f	0					0	0
11010	noree	1252	2026-11-30	4	LOEIZA	14340	#ccffff		0	0	Ø7Ht3	f	0					0	0
10918	noree	1248	2026-09-22	2	LEB ENERGIE	9905	#a9acb2		0	0		f	0					0	0
11019	noree	1219	2026-11-20	18	PAULIC	9906	#ccffcc	gaec PAULIC\n\nKERREO\n\n56330 PLUVIGNER\n\n260403 PAR CS	0	0		f	0					0	0
10157	noree	1246	2026-10-05	20	FAIL	9904	#a9acb2	GAEC DU FAIL \n\n27 ROUTE DE RENNES\n\n35410 DOMLOUP\n\n07 86 01 16 19	0	0	Ø37HT6	f	0					0	0
13528	noree	-2	2026-10-21	13	AGRIKERGAZ	9903	#ccffcc	SAS AGRI KERGAZ\n\nLOTUEN\n\n56700 KERVIGNAC\n\nCH 250706 PAR CS	0	0		f	0					0	0
10186	noree	1239	2026-10-21	12	AUFFRET	9903	#a9acb2	SCEA AUFFRET Pierre Luc\nKerrivarch\n29 PLONEVEZ DU FAOU\n250707 PAR CS\n\n\n	0	0	Ø26 HT6	f	0					0	0
10137	noree	1245	2027-02-19	27	LE CANUT ENERGIE	9903	#73f573	LE CANUT ENERGIE\n\nVILLE NEUVE\n\n35380 PLELAN LE GRAND CH 26015\n\nPAR FD	0	0	Ø36HT8	f	0					0	0
13481	noree	1250	2026-10-22	15	LG BIOGAZ	9905	#ccffcc		0	0		f	0					0	0
12999	couvran	1219	2027-01-19	53	BEARN	9904	#ccffcc	SCEA DU BEARN \n\nREMI LE GARREC \n\nLISLOCH 29300 QUIMPERLE\n\n06 84 68 80 41 \n\n\n\nD 052607457 YT	0	0	STABULE	f	0					0	0
12973	couvran	1219	2027-04-02	25	LE PETIT ROCHER	17900	#ccffcc	EARL du petit rocher \n\nPleslin trivagou\n\nAdresse : rocher trivagou\n\nMartin Guillaume\n\n06.35.51.70.46	0	0		f	0					0	0
12975	couvran	1221	2027-03-26	11	ANGER	17900	#ccffcc	ANGER Xavier \n\nSt leau \n\n22210 Plumieux 	0	0	HANGAR	f	0					0	0
12089	couvran	1220	2026-08-24	37	GAEC DE LOHAN	9904	#ccffcc	Gaec de lohan \n\nlohan \n\n22460 le quillio \n\n06 89 47 45 38 	0	0		f	0					0	0
11021	noree	1253	2026-12-24	60	AGROBREIZH ENERGIE	14340	#73f573	AGROBREIZH ENERGIE\n\nIRVIN EONNET\n\n1 LE COQUENO\n\n56580 CREDIN\n\n260601 PAR FD	0	0		f	0					0	0
10924	noree	1248	2026-11-10	5	AGRI ENERGIE	9903	#eab308	AGRI ENERGIE SARL\n\nMR MORIN ET BOISHARDY\n\n45 BRANGOLO\n\n22940 PLAINTEL\n\nFD	0	0	Ø7HT4	f	0					0	0
11012	noree	1248	2027-04-26	25	MT NRJ	14340	#73f573	SAS MT NRJ\n\nPONT ER GUEL\n\n56420 PLAUDREN\n\nCH260608 PAR FD	0	0	Ø26 HT8	f	0					0	0
10127	noree	1239	2027-01-14	14	AGROBREIZH ENERGIE	9904	#a9acb2	AGROBREIZH ENERGIE\n\nIRVIN EONNET\n\n1 LE COQUENO\n\n56580 CREDIN\n\n260601 PAR FD	0	0	Ø26HT6	f	0					0	0
10133	noree	1244	2026-08-31	64	BONENFANT DOL	9906	#ccffcc	ETS BONENFANT\n\nSITE DOL DE BRETAGNE\n\n22650 DOL DE BRETAGNE\n\nCH 260611 PAR CS	0	0		f	0					0	0
11076	noree	1251	2026-12-07	25	DEBRAY	9903	#73f573	SAS DEBRAY\n\nBARBERIE\n\n44290 GUEMENE PENFAO\n\nCH 260305 PAR CS	0	0	Ø26HT8	f	0					0	0
10131	noree	1243	2026-06-15	44	BEDEL	9904	#ccffcc	GAEC BEDEL\n\n1 LE GRAND PAGE\n\n22330 LANGOURLA\n\n06 20 99 35 21\n\nCH 241105 PAR FD	0	0		f	0					0	0
11063	noree	1251	2026-08-31	14	SODIAAL	9903	#ee9a5d		0	0	Ø26HT7	f	0					0	0
13505	noree	-2	2026-09-07	15	LISNOBLE	9904	#ffff99	SCEA ELEVAGE LISNOBLE\n\nLISNOBLE\n\n22650 BEAUSSAIS SUR MER\n\n250505 PAR PC	0	0		f	0					0	0
13541	noree	1239	2026-09-25	7	AUFFRET	9903	#a9acb2	SCEA AUFFRET Pierre Luc\n\nKerrivarch\n\n29 PLONEVEZ DU FAOU\n\n250707 PAR CS	0	0	Ø26 HT6	f	0					0	0
13680	noree	1254	2026-10-21	32	LH EYGREEM	14340	#00b050	SAS LH EYGREEM\nBOLUMET 56300 NEUILLAC\nCH 260803 PAR FD\nPOST GRDF-EPURATEUR-TORCHERE-TREMIE-PISTE DE LAVAGE-FOSSE CARRE\n100 000 €	0	0	TREMIE	f	0					0	0
13662	noree	1254	2026-10-14	5	LE HELLES - HOMAIR	14340	#ccffff	CAMPING LE HELLES\n55 RUE DU PETIT BOURG 29120 COMBRIT\nRENOVATION 12 325 €\nCH 260801 PAR CS	0	0	RENOVATION	f	0					0	0
10913	noree	1247	2026-07-20	53	JEGOREL	9906	#ccffcc	JEGOREL \nCOUET DELE\n56500 REGUINY\n\nSTAB + ROTO          216000 €	0	0		f	0					0	0
11047	noree	1240	2026-10-05	23	BOUQUIDY	9906	#ccffcc	EARL BOUQUIDY\n\nBOUQUIDY\n\n35750 IFFENDIC\n\nCH 260702 PAR CS	0	0		f	0					0	0
11627	noree	1240	2026-07-15	6	ROCHE MARTIN	9906	#ffff99	SCEA ROCHE MARTIN\n\nSébastien MEHEUST\n\nLA ROCHE MARTIN\n\n22120 ST RENE\n\nPC	0	0		f	0					0	0
11077	noree	1251	2027-01-20	24	DEBRAY	9903	#73f573	SAS DEBRAY\n\nBARBERIE\n\n44290 GUEMENE PENFAO\n\nCH 260305 PAR CS	0	0	Ø32HT8	f	0					0	0
10915	noree	1247	2027-02-18	30	DARTOIS	9906	#ccffcc	SARL DARTOIS\n\nLE BEAU CHENE\n\n22350 GUITTE\n\nCH260504 PAR CS\n\nHANGAR      114 152.77 €	0	0	HANGAR	f	0					0	0
14002	couvran	1216	2026-11-17	3	CHENAIS	9904	#eab308	SCEA CHENAIS\n\nROUTE DE LIGNOL\n\n56160 PERSQUEN\n\n260604 PAR PC\n\n	0	0	Ø20.8HT4	f	0					0	0
14003	couvran	1216	2026-11-24	3	CHENAIS	9904	#eab308	SCEA CHENAIS\n\nROUTE DE LIGNOL\n\n56160 PERSQUEN\n\n260604 PAR PC\n\n	0	0	Ø20.8HT4	f	0					0	0
14004	couvran	1216	2026-12-02	2	VAULTIER 	9904	#ccffff		0	0	FOSSE Ø21.00 ht 3.00 m 	f	0					0	0
14005	couvran	1216	2026-12-04	4	CROIX GOMBERT 	9904	#eab308	SARL LA CROIX GOMBERT \n\nLa Croix Gombert \n\n22350 Yvinniac La Tour \n\n06 08 34 51 33 	0	0	Ø22.5HT4	f	0					0	0
14006	couvran	1216	2026-12-10	6	LE ROY	14340	#a9a7a7	SAS INVEST BIOGAZ VERT MLJ BZH\n\nPATRICE LESAIGE\n\nLA VILLE CHEZE\n\n35360 LANDUJAN\n\n06 08 00 61 61\n\nCH 250905 PAR CS	0	0	Ø21HT6	f	0					0	0
11065	noree	1251	2026-11-10	4	DEBRAY	9903	#73f573	SAS DEBRAY\n\nBARBERIE\n\n44290 GUEMENE PENFAO\n\nCH 260305 PAR CS	0	0	Ø32HT8	f	0					0	0
10222	noree	1244	2026-11-30	20	FAIL	9904	#ccffcc	GAEC DU FAIL \n\n27 ROUTE DE RENNES\n\n35410 DOMLOUP\n\n07 86 01 16 19	0	0		f	0					0	0
13679	noree	1254	2026-12-07	65	HEOL SPLANN	14340	#00b050	SARL HEOL SPLANN\nLES CHAMPS PERRIN 22250 EREAC\nCH 260804 PAR FD\nPONT BASCULE-MUR SILO-GRDF-EPURATEUR-TORCHERE-TREMIE-FUMIERE-GAINE INTER FOSSE           269 000 €	0	0	TREMIE-FUMIERE	f	0					0	0
10275	noree	1239	2026-11-06	15	AUFFRET	9903	#a9acb2	SCEA AUFFRET Pierre Luc\n\nKerrivarch\n\n29 PLONEVEZ DU FAOU\n\n250707 PAR CS	0	0	Ø32HT6	f	0					0	0
11014	noree	1249	2026-09-21	25	HENRIES	9905	#ccffcc	GAEC L'HENRIES\n\nMRS ROUVRAY\n\nL'Henries\n\n56120 PLEUGRIFFET	0	0		f	0					0	0
10155	noree	1253	2026-10-20	4	AUFFRET	9903	#a9acb2	SCEA AUFFRET Pierre Luc\n\nKerrivarch\n\n29 PLONEVEZ DU FAOU\n\n250707 PAR CS	0	0		f	0					0	0
11015	noree	1249	2026-10-26	7	ROBERT	9903	#ffff99	ROBERT JEAN FRANCOIS\n\n22 PLANCOET	0	0		f	0					0	0
11625	noree	1250	2026-11-13	8	MINOTERIE	9905	#ccffcc	EARL LA MINOTERIE\n\nJEAN MARC LE GOFF\n\nLE DIFFAUT \n\n22600 LOUDEAC\n\nCH 260406-3 PAR CS	0	0		f	0					0	0
13693	noree	1246	2027-03-10	27	HEOL SPLANN	14340	#73f573	SARL HEOL SPLANN\nLD LES CHAMPS PERRIN 22250 EREAC\nCH 260804 PAR FD	0	0	Ø35 HT8	f	0					0	0
11016	noree	1249	2026-11-04	29	ANNEE ENERGIE	9903	#ccffcc		0	0		f	0					0	0
13694	noree	1246	2027-04-16	6	HEOL SPLANN	14340	#ccffff	SARL HEOL SPLANN\nLD LES CHAMPS PERRIN 22250 EREAC\nCH 260804 PAR FD	0	0	Ø7 HT4	f	0					0	0
9966	noree	1251	2026-11-17	14	METHA BEQUILLE	9905	#a9acb2	METHA BEQUILLE\n\nGUILLAUME MEREL\n\nBEQUILLE\n\n35160 MONTERFIL\n\n06 10 94 73 88\n\nCH 240802 PAR FD	0	0	Ø25 HT6	f	0					0	0
11623	noree	1254	2027-10-29	7	FLORALE	14340	#eab308	SAS LA FLORALE\n\n44 GUEMENE PENFAO\n\n260602 PAR CS	0	0	Ø7HT4	f	0					0	0
10927	noree	1248	2027-02-10	4	AMYL ENERGIES	9903	#ccffff		0	0	Ø7HT3	f	0					0	0
11064	noree	1251	2026-11-04	4	DEBRAY	9903	#73f573	SAS DEBRAY\n\nBARBERIE\n\n44290 GUEMENE PENFAO\n\nCH 260305 PAR CS	0	0	Ø26HT8	f	0					0	0
13480	noree	1250	2026-11-25	15	LEB ENERGIES	9905	#ccffcc		0	0		f	0					0	0
13403	noree	1215	2026-09-24	5	METHASKAER	9905	#ccffcc		0	0		f	0					0	0
11048	noree	1250	2027-03-16	50	ECOVAL	9904	#ccffcc	GAEC DES ROCHERS\n\nFABIEN TERTRAIS\n\n56380 ST MALO DE BEIGNON\n\nCH 240902 PAR FD	0	0		f	0					0	0
11020	noree	1249	2027-01-15	35	AUFFRET	9903	#ccffcc	SCEA AUFFRET Pierre Luc\nKerrivarch\n29 PLONEVEZ DU FAOU\n250707 PAR CS	0	0		f	0					0	0
13479	noree	1251	2026-09-18	2	MINAUTERIE 	9905	#a9a7a7	EARL LA MINOTERIE\n\nJEAN MARC LE GOFF\n\nLE DIFFAUT \n\n22600 LOUDEAC\n\nCH 260406-3 PAR CS	0	0		f	0					0	0
10158	noree	1246	2026-11-02	5	FAIL	9904	#eab308	GAEC DU FAIL \n\n27 ROUTE DE RENNES\n\n35410 DOMLOUP\n\n07 86 01 16 19	0	0	Ø7HT4	f	0					0	0
12996	couvran	1246	2027-02-11	5	INVEST BIOGAZ	9906	#eab308	SAS INVEST BIOGAZ VERT MLJ BZH\n\nPATRICE LESAIGE\n\nLA VILLE CHEZE\n\n35360 LANDUJAN\n\n06 08 00 61 61\n\nCH 250905 PAR CS\n\n	0	0	Ø7HT4	f	0					0	0
12978	couvran	1216	2026-11-05	2	CROIX GOMBERT 	9904	#eab308	SARL LA CROIX GOMBERT \n\nLa Croix Gombert \n\n22350 Yvinniac La Tour \n\n06 08 34 51 33 	0	0	Ø22.5HT4	f	0					0	0
12988	couvran	1216	2027-02-02	8	DARTOIS	9906	#eab308	SARL DARTOIS\n\nLE BEAU CHENE\n\n22350 GUITTE\n\nCH260504 PAR CS\n\n	0	0	Ø15HT4	f	0					0	0
12984	couvran	1216	2026-10-27	2	CHENAIS	9904	#eab308	SCEA CHENAIS\n\nROUTE DE LIGNOL\n\n56160 PERSQUEN\n\n260604 PAR PC\n\n	0	0	Ø20.8HT4	f	0					0	0
12989	couvran	1216	2027-02-12	10	DARTOIS	9906	#2563eb	SARL DARTOIS\n\nLE BEAU CHENE\n\n22350 GUITTE\n\nCH260504 PAR CS\n\n	0	0	Ø24HT4.5	f	0					0	0
13284	rat	-1	2026-11-17	38	LA HALLERAIS	14340	#ccffff		0	0		f	0					0	0
10272	noree	1240	2026-11-23	110	MINARD	9906	#ffff99	MINARD JOHAN\n\nLA PREVOSTAIS\n\n35290 QUEDILLAC\n\n260205 PC\n\nVERRAT.GEST         296 995 €\n\nPS. ENG                  229 074 €\n\nEMBARQ                 16 179 €	0	0		f	0					0	0
11634	noree	1251	2026-07-24	6	AGRI ENERGIE	9903	#a9a7a7		0	0		f	0					0	0
10220	noree	1240	2026-07-27	30	ROCHE MARTIN	9904	#ffff99	SCEA ROCHE MARTIN\n\nSébastien MEHEUST\n\nLA ROCHE MARTIN\n\n22120 ST RENE\n\nPC	0	0		f	0					0	0
10923	noree	1248	2026-09-24	12	AGRI ENERGIE	9903	#a9acb2	AGRI ENERGIE SARL\n\nMR MORIN ET BOISHARDY\n\n45 BRANGOLO\n\n22940 PLAINTEL\n\nFD	0	0	Ø26HT6	f	0					0	0
10274	noree	1245	2027-04-05	5	LE CANUT ENERGIE	14340	#eab308	LE CANUT ENERGIE\n\nVILLE NEUVE\n\n35380 PLELAN LE GRAND CH 26015\n\nPAR FD	0	0	Ø9HT4	f	0					0	0
11062	noree	1251	2026-09-22	20	ANNEE ENERGIE	9903	#a9a7a7	SARL ANNEE ENERGIES\n\n25 LA BLEURAIS\n\n35330 LA CHAPELLE BOUEXIC\n\n06 16 76 95 9	0	0	Ø26 HT6	f	0					0	0
12993	couvran	1216	2027-03-10	10	BEARN	14340	#eab308	SCEA DU BEARN \n\nREMI LE GARREC \n\nLISLOCH 29300 QUIMPERLE\n\n06 84 68 80 41 \n\n\n\nD 052607457 YT	0	0	Ø28.30	f	0					0	0
12994	couvran	1216	2026-11-20	2	LE ROY	14340	#a9a7a7	SAS INVEST BIOGAZ VERT MLJ BZH\n\nPATRICE LESAIGE\n\nLA VILLE CHEZE\n\n35360 LANDUJAN\n\n06 08 00 61 61\n\nCH 250905 PAR CS	0	0	Ø21HT6	f	0					0	0
12097	couvran	1222	2026-11-05	7	MAISON MADELEINE	9904	#ccffff	SCEA MAISON MADELEINE\n\n18 RUE DES ARNIERES\n\n77700 BAILLY ROMAINVILLIERS\n\n06 37 33 67 40\n\nCH 220908 PAR FD	0	0	Ø29.6HT3	f	0					0	0
12155	couvran	1219	2026-08-26	15	LA VILLE LEO	17900	#ccffcc		0	0		f	0					0	0
11639	couvran	1221	2026-08-31	24	LIVET	17900	#ccffcc		0	0		f	0					0	0
13001	couvran	1222	2027-12-29	125	CORBET	9905	#ccffcc		0	0		f	0					0	0
12079	couvran	1215	2026-10-15	24	L'ETIMIEUX	9903	#ffff99	EARL DE L'ETIMIEUX\n\n45 RUE L'ETIMIEUX\n\n22400 COETMIEUX\n\n260605 PAR PC	0	0		f	0					0	0
12997	couvran	1219	2026-12-16	9	GASCOIN	9906	#ccffcc	GASCOIN PASCAL \n\n14 RUE DE LA CROIX VERTE \n\n56490 MENEAC \n\n\n\nD 052606440 PC 	0	0		f	0					0	0
12980	couvran	1256	2026-11-23	2	HINALUT	9904	#eab308	EARL HINAULT \n\nLES PORTE MONVOISINS\n\n22510 BREHAND 	0	0	Ø18HT4	f	0					0	0
12986	couvran	1216	2027-01-21	2	BEARN	9904	#eab308	ANGER Xavier \n\nSt leau \n22210 Plumieux	0	0	Ø28.3	f	0					0	0
12085	couvran	1216	2026-08-24	10	PECHEUX	9904	#eab308	Gaec pecheux bossiguel \n\nBossiguel 22150 Gausson \n\n06 88 65 82 19 	0	0	Ø22.5HT4	f	0					0	0
10919	noree	1248	2026-10-12	14	LEB ENERGIE	9905	#a9acb2	SAS LEB ENERGIES\n\nLA GIRARDIERE\n\n50410 MONTPERTUIS\n\n240204 FD	0	0	Ø26HT6	f	0					0	0
10920	noree	1248	2026-09-02	14	AGRI ENERGIE	9903	#a9acb2	AGRI ENERGIE SARL\n\nMR MORIN ET BOISHARDY\n\n45 BRANGOLO\n\n22940 PLAINTEL\n\nFD	0	0	Ø26HT6	f	0					0	0
13701	rat	1228	2026-09-14	7	dartois dalle et semelles 	9906	#ccffcc		0	0		f	0					0	0
11628	noree	1240	2026-07-23	2	COSPEREC	9903	#73f573		0	0		f	0					0	0
10221	noree	1253	2026-09-30	3	METHASKAER	9905	#ccffcc	BIO METHA SKAER\n\nPENKER\n\n29390 SCAER\n\n06 61 83 32 42	0	0		f	0					0	0
11046	noree	1250	2026-09-23	21	DEVANT SARL	9905	#ccffcc	SARL LES DEVANTS\n\nJEAN MARC LE GOFF\n\nLE DIFFAUT \n\n22600 LOUDEAC\n\nCH 260406-1 PAR CS	0	0		f	0					0	0
11630	noree	1246	2026-08-31	12	HENRIES	9905	#a9a7a7		0	0	Ø37HT6	f	0					0	0
11638	couvran	1221	2026-10-27	15	HENRY	17900	#ccffcc	Jean-Marc HENRY \n\n7 LE QUINTINAIS \n\n22600 TREVE 	0	0		f	0					0	0
12086	couvran	1216	2026-10-06	4	PRE FONTAINE	9904	#eab308	HAMEON VINCENT \n\nLES AULNAIS \n\n22250 BROONS \n\n06 78 54 24 76 	0	0		f	0					0	0
12095	couvran	1222	2026-10-02	10	LAUNAY G	9904	#eab308	GAEC LAUNAY\n\nLE PETIT LAUNAY\n\n50660 TREILLY QUETTREVILLE/SIENNE\n\n260301 PAR PC\n\n14 décembre 2023 à 14:34\n	0	0	Ø22HT4	f	0					0	0
12084	couvran	1216	2026-09-30	4	ARMOR PONDI	9904	#ccffff	GAEC ARMOR PONDI \n\nLA VILLE ES GICQUIAUX \n\n22130 LANGUENAN \n\n06 87 89 18 13 \n\n\nYT D 052604316	0	0	Ø15HT3	f	0					0	0
12981	couvran	1216	2026-11-27	3	CROIX GOMBERT 	9904	#eab308	SARL LA CROIX GOMBERT \n\nLa Croix Gombert \n\n22350 Yvinniac La Tour \n\n06 08 34 51 33 	0	0	Ø22.5HT4	f	0					0	0
12983	couvran	1256	2026-11-25	5	HINAULT	9904	#eab308	EARL HINAULT \n\nLES PORTE MONVOISINS\n\n22510 BREHAND 	0	0	Peut etre fait en octobre	f	0					0	0
12982	couvran	1216	2026-10-12	3	CLOS PERRIN	9904	#eab308	GAEC CLOS PERRIN\n\nLES MOUSTIERS\n\n56380 GUER \n\n260603 PAR PC	0	0	Ø35.7HT4	f	0					0	0
12985	couvran	1216	2027-02-26	8	ANGER	9904	#eab308	ANGER Xavier \n\nSt leau \n22210 Plumieux\n\nFosse 4.00 m Ø 18 : 52 806.91€	0	0	Ø18HT4	f	0					0	0
12078	couvran	1215	2026-08-24	23	LE GUILLOU	9905	#ffff99	SAS LE GUILLOU\n\nNONAOU\n\n29390 SCAER	0	0		f	0					0	0
12088	couvran	1223	2026-08-24	20	GAEC DE LOHAN	9904	#ccffcc	Gaec de lohan \n\nlohan \n\n22460 le quillio \n\n06 89 47 45 38 	0	0		f	0					0	0
13833	noree	1250	2027-02-09	25	sarl des ribines 	9903	#c00000		0	0		f	0					0	0
13603	noree	1215	2026-11-19	90	RIOU ROMAIN	9905	#ffff99	RIOU Romain\nKerjezegou\n29400 PLOUNEVENTER\n06 62 73 94 90\n\nCH 260704 PAR PC	0	0	MATERNITE 331 081.58€	f	0					0	0
9964	noree	1239	2026-08-31	19	ANNEE ENERGIE	9903	#a9acb2	SARL ANNEE ENERGIES\n\n25 LA BLEURAIS\n\n35330 LA CHAPELLE BOUEXIC\n\n06 16 76 95 9	0	0	Ø37HT6	f	0					0	0
12092	couvran	1222	2026-08-25	7	ROGER	9905	#ccffcc	GAEC ROGER NICOLAS\n\n19 LE MOULIN MOUREAU\n\n35330 SAINT SEGLIN\n\n06 61 47 66 80	0	0	LOGETTE/FOSSE	f	0					0	0
12091	couvran	1223	2026-09-21	55	VILLE GESTIN	9904	#ccffcc	SCEA VILLE GESTIN\n\nERIC DESPRES \n\nLA VILLE GESTIN \n\n22640 PLENEE JUGON\n\nFD	0	0	STABULATION	f	0					0	0
12087	couvran	1239	2026-10-06	5	ANNEE ENERGIE	9903	#eab308	SARL ANNEE ENERGIES\n\n25 LA BLEURAIS\n\n35330 LA CHAPELLE BOUEXIC\n\n06 16 76 95 96	0	0	Ø7HT4	f	0					0	0
12974	couvran	1221	2026-12-14	8	MOULIN DE LA NATION	17900	#ccffcc		0	0		f	0					0	0
12098	couvran	1227	2026-10-29	27	PHARE D'OPALE	14340	#ccffff		0	0		f	0					0	0
13279	rat	1229	2026-12-01	5	LOUIS DE BRETGANE	14340	#2563eb		0	0		f	0					0	0
13287	rat	1229	2026-09-07	8	NETTHESHEIM	14340	#ffff99		0	0		f	0					0	0
13595	rat	1227	2026-09-14	3	loncle et robert 	9903	#73f573		0	0		f	0					0	0
13695	rat	1229	2026-09-01	4	GUESNEUX	9903	#73f573		0	0		f	0					0	0
13288	rat	1228	2026-09-30	69	HAMON	14340	#73f573		0	0		f	0					0	0
13651	noree	1248	2026-08-31	2	depot	14340	#a9a7a7		0	0		f	0					0	0
10128	noree	1239	2027-02-03	16	AGROBREIZH ENERGIE	9904	#a9acb2	AGROBREIZH ENERGIE\n\nIRVIN EONNET\n\n1 LE COQUENO\n\n56580 CREDIN\n\n260601 PAR FD	0	0	Ø26HT6	f	0					0	0
10132	noree	1243	2026-09-14	51	BONENFANT DOL	9906	#ccffcc	ETS BONENFANT\n\nSITE DOL DE BRETAGNE\n\n22650 DOL DE BRETAGNE\n\nCH 260611 PAR CS	0	0		f	0					0	0
11613	noree	1251	2027-02-23	5	DEBRAY	9903	#ccffff		0	0	Ø8HT3	f	0					0	0
10929	noree	1252	2026-10-22	26	LOEIZA	9906	#73f573	SAS LOEIZA\n\nKERREO\n\n56330 PLUVIGNER\n\n260404 PAR CS	0	0	Ø30Ht8	f	0					0	0
9968	noree	1239	2026-12-28	12	METHA DOURIEU	9904	#a9acb2		0	0	Ø20 HT6	f	0					0	0
13478	noree	1250	2026-09-02	15	AGRIKERGAZ	9903	#ccffcc	AGRI ENERGIE SARL\n\nMR MORIN ET BOISHARDY\n\n45 BRANGOLO\n\n22940 PLAINTEL\n\nFD	0	0		f	0					0	0
12987	couvran	1216	2027-01-25	6	DARTOIS	9906	#eab308	SARL DARTOIS\n\nLE BEAU CHENE\n\n22350 GUITTE\n\nCH260504 PAR CS\n\n	0	0	Ø7HT4	f	0					0	0
12093	couvran	1222	2026-09-03	10	BEDEL	9904	#ccffcc	GAEC BEDEL\n\n1 LE GRAND PAGE\n\n22330 LANGOURLA\n\n06 20 99 35 21\n\nCH 241105 PAR FD	0	0		f	0					0	0
9970	noree	1246	2026-12-03	12	ECOVAL	9904	#a9acb2	GAEC DES ROCHERS\n\nFABIEN TERTRAIS\n\n56380 ST MALO DE BEIGNON\n\nCH 240902 PAR FD	0	0	Ø26 HT6	f	0					0	0
13530	noree	1252	2026-12-04	25	LA VILLE ORY 	9906	#ccffcc		0	0		f	0					0	0
11629	noree	1244	2026-07-10	15	METHASKAER	9905	#ccffcc	BIO METHA SKAER\n\nPENKER\n\n29390 SCAER\n\n06 61 83 32 42	0	0		f	0					0	0
10926	noree	1248	2027-01-06	25	AMYL ENERGIES	9903	#73f573	SAS AMYL ENERGIES\n\nLD KERGOAT\n\n29400 SAINT SAUVEUR \n\n PAR CS	0	0	Ø30HT8 Stockage	f	0					0	0
10925	noree	1248	2026-11-25	23	AMYL ENERGIES	9903	#73f573	SAS AMYL ENERGIES\n\nLD KERGOAT\n\n29400 SAINT SAUVEUR \n\n PAR CS	0	0	Ø23HT8 Fermenteur	f	0					0	0
11626	noree	1239	2026-07-13	12	KERVOURCHE	9905	#a9a7a7		0	0	Ø26HT6	f	0					0	0
13829	noree	1239	2027-04-09	15	bioret 	9904	#c00000		0	0	Ø22 HT6	f	0					0	0
13830	noree	1248	2027-07-05	100	sas soubon 	9903	#c00000		0	0		f	0					0	0
13831	noree	-2	2027-03-03	100	transport henry	9903	#c00000		0	0		f	0					0	0
13832	noree	1223	2026-12-08	45	3 vallées	9903	#c00000		0	0		f	0					0	0
13828	noree	1244	2026-12-29	100	earl PAP	9903	#c00000		0	0		f	0					0	0
13858	noree	1250	2027-09-08	50	poirier 	9903	#c00000		0	0		f	0					0	0
13859	noree	1247	2027-09-24	50	salle de boblaye	9903	#c00000		0	0		f	0					0	0
13704	noree	1245	2027-04-12	110	beau chêne 	9906	#c00000		0	0		f	0					0	0
11011	noree	1248	2027-03-25	22	VALLET MARTEAU	14340	#ee9a5d	MARTEAU - LNUF MARQUES\n\nUSINE DE VALLET\n\n44330 VALLET\n\nCH240803 PAR PN	0	0		f	0					0	0
13402	noree	1246	2026-07-16	7	HENRIES	9905	#a9a7a7	GAEC L'HENRIES\n\nMRS ROUVRAY\n\nL'Henries\n\n56120 PLEUGRIFFET	0	0	Ø37HT6	f	0					0	0
10154	noree	1246	2026-09-16	13	FAIL	9904	#a9acb2	GAEC DU FAIL \n\n27 ROUTE DE RENNES\n\n35410 DOMLOUP\n\n07 86 01 16 19	0	0	Ø25HT6	f	0					0	0
10136	noree	1245	2027-01-18	24	LE CANUT ENERGIE	9903	#73f573	LE CANUT ENERGIE\n\nVILLE NEUVE\n\n35380 PLELAN LE GRAND CH 26015\n\nPAR FD	0	0	Ø25HT8	f	0					0	0
10909	noree	1245	2026-12-03	25	INVEST BIOGAZ	9906	#73f573	SAS INVEST BIOGAZ VERT MLJ BZH\n\nPATRICE LESAIGE\n\nLA VILLE CHEZE\n\n35360 LANDUJAN\n\n06 08 00 61 61\n\nCH 250905 PAR CS	0	0	Ø34HT8	f	0					0	0
12995	couvran	1246	2027-02-04	5	INVEST BIOGAZ	9906	#ccffff	SAS INVEST BIOGAZ VERT MLJ BZH\n\nPATRICE LESAIGE\n\nLA VILLE CHEZE\n\n35360 LANDUJAN\n\n06 08 00 61 61\n\nCH 250905 PAR CS\n\n	0	0	Ø7HT3	f	0					0	0
11621	noree	1254	2027-09-21	20	FLORALE	14340	#73f573	SAS LA FLORALE\n\n44 GUEMENE PENFAO\n\n260602 PAR CS	0	0	Ø28HT8	f	0					0	0
11622	noree	1254	2027-10-19	8	FLORALE	14340	#eab308	SAS LA FLORALE\n\n44 GUEMENE PENFAO\n\n260602 PAR CS	0	0	Ø18HT4	f	0					0	0
10908	noree	1246	2027-01-15	14	INVEST BIOGAZ	9906	#a9acb2	SAS INVEST BIOGAZ VERT MLJ BZH\n\nPATRICE LESAIGE\n\nLA VILLE CHEZE\n\n35360 LANDUJAN\n\n06 08 00 61 61\n\nCH 250905 PAR CS	0	0	Ø25 HT6	f	0					0	0
11624	noree	1250	2027-05-25	60	LGP ENERGIE	14340	#73f573	SAS LGP ENERGIE\n\nM. PEURON\n\n213 KERLENAT\n\n56160 LOCMALO\n\n251201 PAR FD	0	0		f	0					0	0
13681	noree	1253	2026-11-12	14	LH EYGREEM	14340	#a9acb2	SAS LH EYGREEM\nBOLUMET 56300 NEUILLAC\nCH 260803 PAR FD	0	0	Ø26 HT6	f	0					0	0
13682	noree	1253	2026-12-02	16	LH EYGREEM	14340	#a9acb2	SAS LH EYGREEM\nBOLUMET 56300 NEUILLAC\nCH 260803 PAR FD	0	0	Ø36 HT6	f	0					0	0
13663	noree	1222	2026-11-17	80	RANNOU	14340	#ffff99	SAS RANNOU \nKERZERRIEN 29190 PLEYBEN\nCH 260802 PAR CS\nENGRAISSEMENT  433 000 €	0	0	ENGRAISSEMENT	f	0					0	0
10916	noree	1249	2027-03-05	50	RUMINY	14340	#ccffcc	GAEC DE  RUMINY\n\nMR GUYOT\n\nLA VIEILLE VILLE\n\n35380 PLELAN LE GRAND\n\nCH 260701 PAR FD\n\nSTABULE   172250  €	0	0	STABULE	f	0					0	0
13310	noree	1239	2026-07-31	1	ROCHE MARTIN	9906	#ffff99	SCEA ROCHE MARTIN\n\nSébastien MEHEUST\n\nLA ROCHE MARTIN\n\n22120 ST RENE\n\nPC	0	0		f	0					0	0
13692	noree	1246	2027-02-18	14	HEOL SPLANN	14340	#a9acb2	SARL HEOL SPLANN\nLD LES CHAMPS PERRIN 22250 EREAC\nCH 260804 PAR FD	0	0	Ø26 HT6	f	0					0	0
11017	noree	1248	2026-11-18	5	AGRI ENERGIE	14340	#ccffcc	AGRI ENERGIE SARL\n\nMR MORIN ET BOISHARDY\n\n45 BRANGOLO\n\n22940 PLAINTEL\n\nFD	0	0	Silo épurateur	f	0					0	0
11618	noree	1251	2027-06-22	24	HERBRECHERE	9903	#73f573	GAEC DE LA HERBRECHERE\n\n12 LA CROIX HAMEL\n\n50600 GRANDPARIGNY\n\n260307 PAR CS	0	0	Ø25HT8	f	0					0	0
11619	noree	1251	2027-07-27	5	HERBRECHERE	9903	#ccffff	GAEC DE LA HERBRECHERE\n\n12 LA CROIX HAMEL\n\n50600 GRANDPARIGNY\n\n260307 PAR CS	0	0	Ø8HT3	f	0					0	0
11075	noree	1251	2026-10-20	11	MINOTERIE	9905	#a9a7a7	EARL LA MINOTERIE\n\nJEAN MARC LE GOFF\n\nLE DIFFAUT \n\n22600 LOUDEAC\n\nCH 260406-3 PAR CS	0	0	Ø25.5HT6	f	0					0	0
10278	noree	1246	2026-12-21	12	INVEST BIOGAZ	9906	#a9a7a7	SAS INVEST BIOGAZ VERT MLJ BZH\n\nPATRICE LESAIGE\n\nLA VILLE CHEZE\n\n35360 LANDUJAN\n\n06 08 00 61 61\n\nCH 250905 PAR CS	0	0	Ø25 HT6	f	0					0	0
13309	noree	1239	2026-07-30	1	ANNEE ENERGIE	9903	#a9a7a7	SARL ANNEE ENERGIES\n\n25 LA BLEURAIS\n\n35330 LA CHAPELLE BOUEXIC\n\n06 16 76 95 96	0	0	Ø26 HT6	f	0					0	0
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, nom, secteur, plan, free, chantier_colors, conducteur_colors, equipe_id_migrated) FROM stdin;
couvran	Couvran	BTP	Pro	1	{#2563eb,#eab308,#00b050,#ee9a5d,#7dd3fc,#73f573,#ffff99,#a9a7a7,#ccffff,#c00000,#2563eb,#ccffcc,#6be66b}	{#2563eb,#16a34a,#dc2626,#9333ea,#ea580c,#0891b2,#ca8a04,#be123c}	t
rat	Le Rat	BTP	Pro	1	{#2563eb,#eab308,#00b050,#ee9a5d,#7dd3fc,#73f573,#ffff99,#a9a7a7,#ccffff,#c00000,#2563eb,#ccffcc,#6be66b}	{#2563eb,#16a34a,#dc2626,#9333ea,#ea580c,#0891b2,#ca8a04,#be123c}	t
noree	Norée construction	BTP	Pro	1	{#2563eb,#eab308,#00b050,#ee9a5d,#7dd3fc,#73f573,#ffff99,#a9a7a7,#ccffff,#c00000,#2563eb,#ccffcc,#6be66b}	{#2563eb,#16a34a,#dc2626,#9333ea,#ea580c,#0891b2,#ca8a04,#be123c}	t
\.


--
-- Data for Name: conducteurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conducteurs (id, nom, color) FROM stdin;
9903	Jeff	#cc99ff
9904	Romain	#da9694
9905	Johann	#00b0f0
9906	Simon	#00b050
14340	Aucun	#ededed
17900	Fabrice	#ffff00
\.


--
-- Data for Name: conges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conges (company_id, equipe, start, duree, nom, id, all_equipes) FROM stdin;
couvran	1215	2026-12-21	8	NOEL	-23	1
rat	1227	2026-08-24	6	VACANCES 26	-3	1
noree	1240	2026-08-24	5	Vacances 26	-10	1
noree	1249	2026-07-29	3	CA	-5	0
noree	1243	2026-12-24	5	NOEL	-1	1
\.


--
-- Data for Name: custom_feries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_feries (id, company_id, nom, date) FROM stdin;
\.


--
-- Data for Name: equipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipes (id, company_id, nom, ordre) FROM stdin;
1215	couvran	QUENTIN	0
1216	couvran	ROLAND	1
1219	couvran	JEROME	3
1220	couvran	REGIS	4
1221	couvran	GILDAS	5
1222	couvran	PEDRO V	6
1223	couvran	DIOGO	7
1227	rat	Kevin ETOUNDI	0
1228	rat	ANTONIN	1
1229	rat	DOM DIDIER	2
1230	rat	VINCENT B	3
-14	rat	VINCENT H	4
-1	rat	YANN B	5
1239	noree	MIGUEL	0
1240	noree	José MANUEL	1
1243	noree	José PINTO	2
1244	noree	PEDRO L	3
1245	noree	ANTHONY	4
1246	noree	BRUNO	5
1247	noree	José RIBEIRO	6
1248	noree	André GUEDES	7
1249	noree	José MEREILES	8
1250	noree	JOSELITO	9
1251	noree	Rui MAGALHES	10
-2	noree	TIAGO	12
\.


--
-- Data for Name: personal_plan_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_plan_items (id, plan_id, row_id, start, duree, nom, color, note) FROM stdin;
43	16	508	2026-08-25	14	bgb	#6b7280	
44	16	509	2026-09-14	9	fgvqs	#f59e0b	
64	16	510	2026-09-25	8	vfvev	#2563eb	
65	16	511	2026-10-07	10	ervrev	#6366f1	
67	16	512	2026-09-15	5	hrr	#ff0088	
111	9	178	2026-09-07	9	BEDEL	#059669	
112	9	178	2026-09-22	3	BEKKI	#2563eb	
113	9	178	2026-09-25	4	BEDEL	#059669	
114	9	178	2026-10-06	2	LAUNAY	#dc2626	
115	9	178	2026-10-08	6	BEKKI	#2563eb	
116	9	178	2026-10-20	3	GD BERCON	#f59e0b	
117	9	178	2026-10-23	5	LAUNAY	#dc2626	
118	9	178	2026-11-03	6	GD BERCON	#f59e0b	
\.


--
-- Data for Name: personal_plan_rows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_plan_rows (id, plan_id, nom, ordre) FROM stdin;
507	16	Tâche 1	0
508	16	Tâche 2	1
509	16	Tâche 3	2
510	16	Tâche 4	3
511	16	Tâche 5	4
512	16	Tâche 6	5
518	17	Tâche 1	0
519	17	Tâche 2	1
520	17	Tâche 3	2
521	17	Tâche 4	3
522	17	Tâche 5	4
523	17	Tâche 6	5
524	17	Tâche 7	6
525	17	Tâche 8	7
526	17	Tâche 9	8
527	18	Tâche 1	0
528	18	Tâche 2	1
529	18	Tâche 3	2
530	18	Tâche 4	3
531	18	Tâche 5	4
172	8	Terrassement	0
183	8	Radier Gaine 	1
177	9	ROLAND	0
178	9	PEDRO	1
\.


--
-- Data for Name: personal_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_plans (id, user_id, nom, start_date, created_at) FROM stdin;
8	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	BONENFANT DOL	2026-08-31	2026-07-28 05:16:30.596798+00
9	2407b7ed-f057-4b44-842f-7026dce4f5eb	Fosse à lisier	2026-07-28	2026-07-28 05:23:32.384583+00
16	0168f0de-46a5-4912-bad1-d4b3205f6384	Nouveau planning	2026-09-07	2026-09-07 18:27:27.118907+00
17	0168f0de-46a5-4912-bad1-d4b3205f6384	Nouveau planning	2026-09-07	2026-09-07 19:30:20.909497+00
18	9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	APS Dépôt	2026-08-31	2026-09-08 08:55:20.048058+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, email, nom, role, created_at, must_change_password) FROM stdin;
c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	j.basset@noree.fr	Johan	lecture	2026-07-24 13:52:43.435223+00	0
62e22fdb-05bf-4bfb-9e6a-74424ef46541	p.carmard@noree.fr	Philippe	lecture	2026-07-24 14:04:37.217215+00	0
3ed8babd-c316-4dd4-b511-2ac6f098cbef	csoyer@noree.fr	Cyril	admin	2026-07-24 09:29:37.693755+00	0
13280cb3-abfb-42c1-982f-514715a026ca	y.tassel@couvran.com	Yoann	planning	2026-07-27 14:08:19.443153+00	0
0ca4b72d-2641-4386-9b06-59df818bda02	f.dayot@noree.fr	Fabrice	planning	2026-07-30 12:55:49.516449+00	0
7caffb15-3aa0-4304-a043-6b992628741c	j.courtel@noree.fr	Jeff	lecture	2026-07-24 09:25:16.796998+00	0
a8602130-044c-4c55-b726-9f4adaeb8f00	admin@couvran.com	Eloise	lecture	2026-09-01 11:58:08.831814+00	0
9f85d70f-f03b-4b59-a65a-a333889c66f7	contact@couvran.com	Stephane	lecture	2026-09-01 12:22:24.767776+00	0
0168f0de-46a5-4912-bad1-d4b3205f6384	t.corlay@noree.fr	Tom	admin	2026-07-23 14:03:09.219251+00	0
4b28001a-bb0c-416a-9e59-d2f39d65f2fe	devis@noree.fr	Marie	planning	2026-07-24 08:47:59.472615+00	0
9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	s.poirier@noree.fr	Simon	lecture	2026-07-24 08:49:44.03091+00	0
2407b7ed-f057-4b44-842f-7026dce4f5eb	r.leherisse@noree.fr	Romain	lecture	2026-07-24 08:52:30.176933+00	0
c4aa0201-db24-4468-b0f6-f5fc6df0d095	batiment@noree.fr	Célia	lecture	2026-07-24 09:00:24.211763+00	0
7bdbaabe-619a-43d1-bac5-27643379bfa7	tcorlay03@gmail.com	tom	lecture	2026-09-09 12:58:31.120858+00	0
\.


--
-- Data for Name: types_chantier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.types_chantier (id, nom, color) FROM stdin;
3	Piscine	#06b6d4
17	Porc	#f472b6
19	Stabule	#15803d
20	Silo	#eab308
21	Fosse	#6b7280
23	Indust	#f97316
18	STEP	#8a480a
\.


--
-- Data for Name: user_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_companies (user_id, company_id) FROM stdin;
0ca4b72d-2641-4386-9b06-59df818bda02	noree
0ca4b72d-2641-4386-9b06-59df818bda02	couvran
0ca4b72d-2641-4386-9b06-59df818bda02	rat
0168f0de-46a5-4912-bad1-d4b3205f6384	noree
0168f0de-46a5-4912-bad1-d4b3205f6384	couvran
0168f0de-46a5-4912-bad1-d4b3205f6384	rat
4b28001a-bb0c-416a-9e59-d2f39d65f2fe	noree
4b28001a-bb0c-416a-9e59-d2f39d65f2fe	couvran
4b28001a-bb0c-416a-9e59-d2f39d65f2fe	rat
9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	noree
9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	couvran
9faaa3f0-688e-4fab-afa9-b6fc9e59f27f	rat
2407b7ed-f057-4b44-842f-7026dce4f5eb	noree
2407b7ed-f057-4b44-842f-7026dce4f5eb	couvran
2407b7ed-f057-4b44-842f-7026dce4f5eb	rat
c4aa0201-db24-4468-b0f6-f5fc6df0d095	noree
c4aa0201-db24-4468-b0f6-f5fc6df0d095	couvran
c4aa0201-db24-4468-b0f6-f5fc6df0d095	rat
7caffb15-3aa0-4304-a043-6b992628741c	noree
7caffb15-3aa0-4304-a043-6b992628741c	couvran
7caffb15-3aa0-4304-a043-6b992628741c	rat
3ed8babd-c316-4dd4-b511-2ac6f098cbef	noree
3ed8babd-c316-4dd4-b511-2ac6f098cbef	couvran
3ed8babd-c316-4dd4-b511-2ac6f098cbef	rat
c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	noree
c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	couvran
c8e2e25a-bee4-4b1e-99e6-c9cef1cccb05	rat
62e22fdb-05bf-4bfb-9e6a-74424ef46541	noree
62e22fdb-05bf-4bfb-9e6a-74424ef46541	couvran
62e22fdb-05bf-4bfb-9e6a-74424ef46541	rat
13280cb3-abfb-42c1-982f-514715a026ca	noree
13280cb3-abfb-42c1-982f-514715a026ca	couvran
13280cb3-abfb-42c1-982f-514715a026ca	rat
a8602130-044c-4c55-b726-9f4adaeb8f00	noree
a8602130-044c-4c55-b726-9f4adaeb8f00	couvran
a8602130-044c-4c55-b726-9f4adaeb8f00	rat
9f85d70f-f03b-4b59-a65a-a333889c66f7	noree
9f85d70f-f03b-4b59-a65a-a333889c66f7	couvran
9f85d70f-f03b-4b59-a65a-a333889c66f7	rat
7bdbaabe-619a-43d1-bac5-27643379bfa7	noree
7bdbaabe-619a-43d1-bac5-27643379bfa7	couvran
7bdbaabe-619a-43d1-bac5-27643379bfa7	rat
\.


--
-- Data for Name: vendeurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendeurs (id, nom, color) FROM stdin;
1	PC	#2563eb
2	FD	#16a34a
3	CS	#f59e0b
4	PN	#dc2626
\.


--
-- Data for Name: messages_2026_09_08; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_09_08 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_09; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_09_09 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_10; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_09_10 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_11; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_09_11 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_12; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_09_12 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_13; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_09_13 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_14; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_09_14 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-06-15 18:57:12
20211116045059	2026-06-15 18:57:13
20211116050929	2026-06-15 18:57:13
20211116051442	2026-06-15 18:57:13
20211116212300	2026-06-15 18:57:14
20211116213355	2026-06-15 18:57:14
20211116213934	2026-06-15 18:57:14
20211116214523	2026-06-15 18:57:15
20211122062447	2026-06-15 18:57:15
20211124070109	2026-06-15 18:57:16
20211202204204	2026-06-15 18:57:16
20211202204605	2026-06-15 18:57:16
20211210212804	2026-06-15 18:57:18
20211228014915	2026-06-15 18:57:18
20220107221237	2026-06-15 18:57:18
20220228202821	2026-06-15 18:57:19
20220312004840	2026-06-15 18:57:19
20220603231003	2026-06-15 18:57:20
20220603232444	2026-06-15 18:57:20
20220615214548	2026-06-15 18:57:20
20220712093339	2026-06-15 18:57:21
20220908172859	2026-06-15 18:57:21
20220916233421	2026-06-15 18:57:21
20230119133233	2026-06-15 18:57:22
20230128025114	2026-06-15 18:57:22
20230128025212	2026-06-15 18:57:23
20230227211149	2026-06-15 18:57:23
20230228184745	2026-06-15 18:57:23
20230308225145	2026-06-15 18:57:24
20230328144023	2026-06-15 18:57:24
20231018144023	2026-06-15 18:57:24
20231204144023	2026-06-15 18:57:25
20231204144024	2026-06-15 18:57:25
20231204144025	2026-06-15 18:57:26
20240108234812	2026-06-15 18:57:26
20240109165339	2026-06-15 18:57:26
20240227174441	2026-06-15 18:57:27
20240311171622	2026-06-15 18:57:28
20240321100241	2026-06-15 18:57:28
20240401105812	2026-06-15 18:57:29
20240418121054	2026-06-15 18:57:30
20240523004032	2026-06-15 18:57:31
20240618124746	2026-06-15 18:57:31
20240801235015	2026-06-15 18:57:32
20240805133720	2026-06-15 18:57:32
20240827160934	2026-06-15 18:57:33
20240919163303	2026-06-15 18:57:33
20240919163305	2026-06-15 18:57:33
20241019105805	2026-06-15 18:57:34
20241030150047	2026-06-15 18:57:35
20241108114728	2026-06-15 18:57:36
20241121104152	2026-06-15 18:57:36
20241130184212	2026-06-15 18:57:36
20241220035512	2026-06-15 18:57:37
20241220123912	2026-06-15 18:57:37
20241224161212	2026-06-15 18:57:37
20250107150512	2026-06-15 18:57:38
20250110162412	2026-06-15 18:57:38
20250123174212	2026-06-15 18:57:38
20250128220012	2026-06-15 18:57:39
20250506224012	2026-06-15 18:57:39
20250523164012	2026-06-15 18:57:39
20250714121412	2026-06-15 18:57:40
20250905041441	2026-06-15 18:57:40
20251103001201	2026-06-15 18:57:41
20251120212548	2026-06-15 18:57:41
20251120215549	2026-06-15 18:57:41
20260218120000	2026-06-15 18:57:42
20260326120000	2026-06-15 18:57:42
20260514120000	2026-06-15 18:57:43
20260527120000	2026-06-15 18:57:43
20260528120000	2026-06-15 18:57:44
20260603120000	2026-06-15 18:57:44
20260605120000	2026-06-16 06:56:22
20260606110000	2026-06-16 06:56:22
20260616120000	2026-06-30 06:25:00
20260624120000	2026-06-30 06:25:01
20260626120000	2026-07-02 13:41:44
20260706120000	2026-07-13 07:18:28
20260707120000	2026-07-15 06:06:03
20260709120000	2026-07-15 06:06:04
20260714120000	2026-09-04 05:36:12
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type, versioning_status) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-06-15 16:26:23.455068
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-06-15 16:26:23.493899
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-06-15 16:26:23.500022
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-06-15 16:26:23.525461
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-06-15 16:26:23.541426
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-06-15 16:26:23.547267
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-06-15 16:26:23.554079
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-06-15 16:26:23.56084
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-06-15 16:26:23.56746
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-06-15 16:26:23.573904
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-06-15 16:26:23.58038
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-06-15 16:26:23.588258
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-06-15 16:26:23.595198
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-06-15 16:26:23.602193
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-06-15 16:26:23.609078
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-06-15 16:26:23.636758
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-06-15 16:26:23.644141
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-06-15 16:26:23.650474
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-06-15 16:26:23.656849
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-06-15 16:26:23.664585
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-06-15 16:26:23.670767
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-06-15 16:26:23.679563
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-06-15 16:26:23.698096
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-06-15 16:26:23.71026
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-06-15 16:26:23.717266
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-06-15 16:26:23.724045
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-06-15 16:26:23.731064
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-06-15 16:26:23.739281
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-06-15 16:26:23.747397
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-06-15 16:26:23.753449
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-06-15 16:26:23.759357
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-06-15 16:26:23.765621
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-06-15 16:26:23.771452
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-06-15 16:26:23.777253
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-06-15 16:26:23.783253
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-06-15 16:26:23.7891
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-06-15 16:26:23.796046
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-06-15 16:26:23.802803
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-06-15 16:26:23.809849
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-06-15 16:26:23.824728
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-06-15 16:26:23.830417
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-06-15 16:26:23.837315
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-06-15 16:26:23.843153
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-06-15 16:26:23.849355
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-06-15 16:26:23.855101
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-06-15 16:26:23.861785
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-06-15 16:26:23.881373
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-06-15 16:26:23.888689
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-06-15 16:26:23.894615
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-06-15 16:26:23.916444
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-06-15 16:26:23.922844
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-06-15 16:26:24.538613
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-06-15 16:26:24.541255
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-06-15 16:26:24.552979
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-06-15 16:26:24.556857
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-06-15 16:26:24.559296
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-06-15 16:26:24.56694
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-06-15 16:26:24.574283
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-06-15 16:26:24.580957
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-06-15 16:26:24.588672
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-06-15 16:26:24.595026
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-16 16:20:23.803829
62	object-versioning-core	0b855f00ff3be0bfca91efee02a9858912491a9a	2026-08-20 07:02:17.303295
63	fix-search-name-relative-to-prefix	c7485e417624f795ce8bb2da21927f48e088904d	2026-08-29 11:59:01.247455
64	fix-search-by-timestamp-sqli	0af424ecd388a39bb1645184b222185a12149675	2026-08-29 11:59:01.275904
65	objects-key-version-index	603c1c55658e982d35839001e2c2b59a50703904	2026-09-07 19:33:04.478842
66	objects-current-version-index	191466c93aa2c46a00e36505577c5fcab8d7cb4b	2026-09-07 19:33:04.485065
67	objects-null-version-index	15bfe8c35b66642b6c78ba60060fa8793bd2207a	2026-09-07 19:33:04.489658
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, archived_at, is_delete_marker, is_versioned) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 875, true);


--
-- Name: chantiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chantiers_id_seq', 14029, true);


--
-- Name: conducteurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conducteurs_id_seq', 50148, true);


--
-- Name: conges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conges_id_seq', 1, false);


--
-- Name: custom_feries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_feries_id_seq', 237, true);


--
-- Name: equipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipes_id_seq', 1290, true);


--
-- Name: personal_plan_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_plan_items_id_seq', 118, true);


--
-- Name: personal_plan_rows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_plan_rows_id_seq', 531, true);


--
-- Name: personal_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_plans_id_seq', 18, true);


--
-- Name: types_chantier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.types_chantier_id_seq', 23, true);


--
-- Name: vendeurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendeurs_id_seq', 8, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_realtime_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: chantiers chantiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chantiers
    ADD CONSTRAINT chantiers_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: conducteurs conducteurs_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conducteurs
    ADD CONSTRAINT conducteurs_nom_key UNIQUE (nom);


--
-- Name: conducteurs conducteurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conducteurs
    ADD CONSTRAINT conducteurs_pkey PRIMARY KEY (id);


--
-- Name: conges conges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conges
    ADD CONSTRAINT conges_pkey PRIMARY KEY (id);


--
-- Name: custom_feries custom_feries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_feries
    ADD CONSTRAINT custom_feries_pkey PRIMARY KEY (id);


--
-- Name: equipes equipes_company_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_company_nom_key UNIQUE (company_id, nom);


--
-- Name: equipes equipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_pkey PRIMARY KEY (id);


--
-- Name: personal_plan_items personal_plan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_plan_items
    ADD CONSTRAINT personal_plan_items_pkey PRIMARY KEY (id);


--
-- Name: personal_plan_rows personal_plan_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_plan_rows
    ADD CONSTRAINT personal_plan_rows_pkey PRIMARY KEY (id);


--
-- Name: personal_plans personal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_plans
    ADD CONSTRAINT personal_plans_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: types_chantier types_chantier_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_chantier
    ADD CONSTRAINT types_chantier_nom_key UNIQUE (nom);


--
-- Name: types_chantier types_chantier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_chantier
    ADD CONSTRAINT types_chantier_pkey PRIMARY KEY (id);


--
-- Name: user_companies user_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_pkey PRIMARY KEY (user_id, company_id);


--
-- Name: vendeurs vendeurs_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendeurs
    ADD CONSTRAINT vendeurs_nom_key UNIQUE (nom);


--
-- Name: vendeurs vendeurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendeurs
    ADD CONSTRAINT vendeurs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_08 messages_2026_09_08_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_08
    ADD CONSTRAINT messages_2026_09_08_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_09 messages_2026_09_09_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_09
    ADD CONSTRAINT messages_2026_09_09_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_10 messages_2026_09_10_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_10
    ADD CONSTRAINT messages_2026_09_10_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_11 messages_2026_09_11_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_11
    ADD CONSTRAINT messages_2026_09_11_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_12 messages_2026_09_12_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_12
    ADD CONSTRAINT messages_2026_09_12_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_13 messages_2026_09_13_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_13
    ADD CONSTRAINT messages_2026_09_13_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_14 messages_2026_09_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_14
    ADD CONSTRAINT messages_2026_09_14_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_08_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_08_inserted_at_topic_idx ON realtime.messages_2026_09_08 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_09_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_09_inserted_at_topic_idx ON realtime.messages_2026_09_09 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_10_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_10_inserted_at_topic_idx ON realtime.messages_2026_09_10 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_11_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_11_inserted_at_topic_idx ON realtime.messages_2026_09_11 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_12_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_12_inserted_at_topic_idx ON realtime.messages_2026_09_12 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_13_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_13_inserted_at_topic_idx ON realtime.messages_2026_09_13 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_14_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_14_inserted_at_topic_idx ON realtime.messages_2026_09_14 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: idx_objects_current_version; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_objects_current_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (archived_at IS NULL);


--
-- Name: idx_objects_null_version; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_objects_null_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (NOT is_versioned);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_name_version_key; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_name_version_key ON storage.objects USING btree (bucket_id, name COLLATE "C", version) NULLS NOT DISTINCT;


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2026_09_08_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_08_inserted_at_topic_idx;


--
-- Name: messages_2026_09_08_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_08_pkey;


--
-- Name: messages_2026_09_09_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_09_inserted_at_topic_idx;


--
-- Name: messages_2026_09_09_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_09_pkey;


--
-- Name: messages_2026_09_10_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_10_inserted_at_topic_idx;


--
-- Name: messages_2026_09_10_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_10_pkey;


--
-- Name: messages_2026_09_11_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_11_inserted_at_topic_idx;


--
-- Name: messages_2026_09_11_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_11_pkey;


--
-- Name: messages_2026_09_12_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_12_inserted_at_topic_idx;


--
-- Name: messages_2026_09_12_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_12_pkey;


--
-- Name: messages_2026_09_13_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_13_inserted_at_topic_idx;


--
-- Name: messages_2026_09_13_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_13_pkey;


--
-- Name: messages_2026_09_14_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_14_inserted_at_topic_idx;


--
-- Name: messages_2026_09_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_14_pkey;


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chantiers chantiers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chantiers
    ADD CONSTRAINT chantiers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: conges conges_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conges
    ADD CONSTRAINT conges_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: custom_feries custom_feries_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_feries
    ADD CONSTRAINT custom_feries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: equipes equipes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: personal_plan_items personal_plan_items_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_plan_items
    ADD CONSTRAINT personal_plan_items_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.personal_plans(id) ON DELETE CASCADE;


--
-- Name: personal_plan_items personal_plan_items_row_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_plan_items
    ADD CONSTRAINT personal_plan_items_row_id_fkey FOREIGN KEY (row_id) REFERENCES public.personal_plan_rows(id) ON DELETE CASCADE;


--
-- Name: personal_plan_rows personal_plan_rows_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_plan_rows
    ADD CONSTRAINT personal_plan_rows_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.personal_plans(id) ON DELETE CASCADE;


--
-- Name: personal_plans personal_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_plans
    ADD CONSTRAINT personal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_companies user_companies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_companies user_companies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: chantiers admin delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin delete" ON public.chantiers FOR DELETE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: conducteurs admin delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin delete" ON public.conducteurs FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: conges admin delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin delete" ON public.conges FOR DELETE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: custom_feries admin delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin delete" ON public.custom_feries FOR DELETE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: equipes admin delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin delete" ON public.equipes FOR DELETE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: types_chantier admin delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin delete" ON public.types_chantier FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: vendeurs admin delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin delete" ON public.vendeurs FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: chantiers admin insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin insert" ON public.chantiers FOR INSERT WITH CHECK ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: conducteurs admin insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin insert" ON public.conducteurs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: conges admin insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin insert" ON public.conges FOR INSERT WITH CHECK ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: custom_feries admin insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin insert" ON public.custom_feries FOR INSERT WITH CHECK ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: equipes admin insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin insert" ON public.equipes FOR INSERT WITH CHECK ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: types_chantier admin insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin insert" ON public.types_chantier FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: vendeurs admin insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin insert" ON public.vendeurs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: chantiers admin update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin update" ON public.chantiers FOR UPDATE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: conducteurs admin update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin update" ON public.conducteurs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: conges admin update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin update" ON public.conges FOR UPDATE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: custom_feries admin update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin update" ON public.custom_feries FOR UPDATE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: equipes admin update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin update" ON public.equipes FOR UPDATE USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: types_chantier admin update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin update" ON public.types_chantier FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: vendeurs admin update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin update" ON public.vendeurs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'planning'::text]))))));


--
-- Name: chantiers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chantiers ENABLE ROW LEVEL SECURITY;

--
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- Name: conducteurs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conducteurs ENABLE ROW LEVEL SECURITY;

--
-- Name: conges; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conges ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_feries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.custom_feries ENABLE ROW LEVEL SECURITY;

--
-- Name: equipes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_plan_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.personal_plan_items ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_plan_rows; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.personal_plan_rows ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.personal_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: types_chantier; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.types_chantier ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_plan_items user deletes own items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user deletes own items" ON public.personal_plan_items FOR DELETE USING ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: personal_plans user deletes own plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user deletes own plans" ON public.personal_plans FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: personal_plan_rows user deletes own rows; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user deletes own rows" ON public.personal_plan_rows FOR DELETE USING ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: personal_plan_items user inserts own items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user inserts own items" ON public.personal_plan_items FOR INSERT WITH CHECK ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: personal_plans user inserts own plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user inserts own plans" ON public.personal_plans FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: personal_plan_rows user inserts own rows; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user inserts own rows" ON public.personal_plan_rows FOR INSERT WITH CHECK ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: personal_plan_items user sees own items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user sees own items" ON public.personal_plan_items FOR SELECT USING ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: personal_plans user sees own plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user sees own plans" ON public.personal_plans FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: personal_plan_rows user sees own rows; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user sees own rows" ON public.personal_plan_rows FOR SELECT USING ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: personal_plan_items user updates own items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user updates own items" ON public.personal_plan_items FOR UPDATE USING ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: personal_plans user updates own plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user updates own plans" ON public.personal_plans FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: personal_plan_rows user updates own rows; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user updates own rows" ON public.personal_plan_rows FOR UPDATE USING ((plan_id IN ( SELECT personal_plans.id
   FROM public.personal_plans
  WHERE (personal_plans.user_id = auth.uid()))));


--
-- Name: user_companies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: conducteurs users can view all conducteurs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view all conducteurs" ON public.conducteurs FOR SELECT USING (true);


--
-- Name: types_chantier users can view all types_chantier; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view all types_chantier" ON public.types_chantier FOR SELECT USING (true);


--
-- Name: vendeurs users can view all vendeurs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view all vendeurs" ON public.vendeurs FOR SELECT USING (true);


--
-- Name: companies users can view own companies; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view own companies" ON public.companies FOR SELECT USING ((id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: chantiers users can view own company data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view own company data" ON public.chantiers FOR SELECT USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: conges users can view own company data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view own company data" ON public.conges FOR SELECT USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: custom_feries users can view own company data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view own company data" ON public.custom_feries FOR SELECT USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: equipes users can view own company data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view own company data" ON public.equipes FOR SELECT USING ((company_id IN ( SELECT user_companies.company_id
   FROM public.user_companies
  WHERE (user_companies.user_id = auth.uid()))));


--
-- Name: user_companies users can view own company links; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view own company links" ON public.user_companies FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can view own profile" ON public.profiles FOR SELECT USING ((id = auth.uid()));


--
-- Name: vendeurs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.vendeurs ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION create_user(p_email text, p_password text, p_nom text, p_role text, p_company_ids text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_user(p_email text, p_password text, p_nom text, p_role text, p_company_ids text[]) TO anon;
GRANT ALL ON FUNCTION public.create_user(p_email text, p_password text, p_nom text, p_role text, p_company_ids text[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_user(p_email text, p_password text, p_nom text, p_role text, p_company_ids text[]) TO service_role;


--
-- Name: FUNCTION delete_user(p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.delete_user(p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.delete_user(p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.delete_user(p_user_id uuid) TO service_role;


--
-- Name: FUNCTION get_personal_plans(p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_personal_plans(p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_personal_plans(p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_personal_plans(p_user_id uuid) TO service_role;


--
-- Name: FUNCTION get_planning_data(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_planning_data() TO anon;
GRANT ALL ON FUNCTION public.get_planning_data() TO authenticated;
GRANT ALL ON FUNCTION public.get_planning_data() TO service_role;


--
-- Name: FUNCTION get_users(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_users() TO anon;
GRANT ALL ON FUNCTION public.get_users() TO authenticated;
GRANT ALL ON FUNCTION public.get_users() TO service_role;


--
-- Name: FUNCTION mark_equipes_migrated(p_company_ids text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mark_equipes_migrated(p_company_ids text[]) TO anon;
GRANT ALL ON FUNCTION public.mark_equipes_migrated(p_company_ids text[]) TO authenticated;
GRANT ALL ON FUNCTION public.mark_equipes_migrated(p_company_ids text[]) TO service_role;


--
-- Name: TABLE chantiers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chantiers TO anon;
GRANT ALL ON TABLE public.chantiers TO authenticated;
GRANT ALL ON TABLE public.chantiers TO service_role;


--
-- Name: FUNCTION replace_chantiers(p_company_id text, p_chantiers jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.replace_chantiers(p_company_id text, p_chantiers jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_chantiers(p_company_id text, p_chantiers jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_chantiers(p_company_id text, p_chantiers jsonb) TO service_role;


--
-- Name: TABLE conducteurs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conducteurs TO anon;
GRANT ALL ON TABLE public.conducteurs TO authenticated;
GRANT ALL ON TABLE public.conducteurs TO service_role;


--
-- Name: FUNCTION replace_conducteurs(p_company_id text, p_conducteurs jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.replace_conducteurs(p_company_id text, p_conducteurs jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_conducteurs(p_company_id text, p_conducteurs jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_conducteurs(p_company_id text, p_conducteurs jsonb) TO service_role;


--
-- Name: TABLE conges; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conges TO anon;
GRANT ALL ON TABLE public.conges TO authenticated;
GRANT ALL ON TABLE public.conges TO service_role;


--
-- Name: FUNCTION replace_conges(p_company_id text, p_conges jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.replace_conges(p_company_id text, p_conges jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_conges(p_company_id text, p_conges jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_conges(p_company_id text, p_conges jsonb) TO service_role;


--
-- Name: TABLE custom_feries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.custom_feries TO anon;
GRANT ALL ON TABLE public.custom_feries TO authenticated;
GRANT ALL ON TABLE public.custom_feries TO service_role;


--
-- Name: FUNCTION replace_custom_feries(p_company_id text, p_feries jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.replace_custom_feries(p_company_id text, p_feries jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_custom_feries(p_company_id text, p_feries jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_custom_feries(p_company_id text, p_feries jsonb) TO service_role;


--
-- Name: TABLE equipes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.equipes TO anon;
GRANT ALL ON TABLE public.equipes TO authenticated;
GRANT ALL ON TABLE public.equipes TO service_role;


--
-- Name: FUNCTION replace_equipes(p_company_id text, p_equipes jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.replace_equipes(p_company_id text, p_equipes jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_equipes(p_company_id text, p_equipes jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_equipes(p_company_id text, p_equipes jsonb) TO service_role;


--
-- Name: FUNCTION save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_custom_feries jsonb, p_chantier_colors text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_custom_feries jsonb, p_chantier_colors text[]) TO anon;
GRANT ALL ON FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_custom_feries jsonb, p_chantier_colors text[]) TO authenticated;
GRANT ALL ON FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_custom_feries jsonb, p_chantier_colors text[]) TO service_role;


--
-- Name: FUNCTION save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_conducteurs jsonb, p_custom_feries jsonb, p_chantier_colors text[], p_conducteur_colors text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_conducteurs jsonb, p_custom_feries jsonb, p_chantier_colors text[], p_conducteur_colors text[]) TO anon;
GRANT ALL ON FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_conducteurs jsonb, p_custom_feries jsonb, p_chantier_colors text[], p_conducteur_colors text[]) TO authenticated;
GRANT ALL ON FUNCTION public.save_all_planning_data(p_chantiers jsonb, p_conges jsonb, p_equipes jsonb, p_conducteurs jsonb, p_custom_feries jsonb, p_chantier_colors text[], p_conducteur_colors text[]) TO service_role;


--
-- Name: FUNCTION save_personal_plan(p_plan_id integer, p_rows jsonb, p_items jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.save_personal_plan(p_plan_id integer, p_rows jsonb, p_items jsonb) TO anon;
GRANT ALL ON FUNCTION public.save_personal_plan(p_plan_id integer, p_rows jsonb, p_items jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.save_personal_plan(p_plan_id integer, p_rows jsonb, p_items jsonb) TO service_role;


--
-- Name: FUNCTION test_regex_func2(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.test_regex_func2() TO anon;
GRANT ALL ON FUNCTION public.test_regex_func2() TO authenticated;
GRANT ALL ON FUNCTION public.test_regex_func2() TO service_role;


--
-- Name: FUNCTION update_all_colors(p_chantier_colors text[], p_conducteur_colors text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_all_colors(p_chantier_colors text[], p_conducteur_colors text[]) TO anon;
GRANT ALL ON FUNCTION public.update_all_colors(p_chantier_colors text[], p_conducteur_colors text[]) TO authenticated;
GRANT ALL ON FUNCTION public.update_all_colors(p_chantier_colors text[], p_conducteur_colors text[]) TO service_role;


--
-- Name: FUNCTION update_company_colors(p_company_id text, p_chantier_colors text[], p_conducteur_colors text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_company_colors(p_company_id text, p_chantier_colors text[], p_conducteur_colors text[]) TO anon;
GRANT ALL ON FUNCTION public.update_company_colors(p_company_id text, p_chantier_colors text[], p_conducteur_colors text[]) TO authenticated;
GRANT ALL ON FUNCTION public.update_company_colors(p_company_id text, p_chantier_colors text[], p_conducteur_colors text[]) TO service_role;


--
-- Name: FUNCTION update_password(p_new_password text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_password(p_new_password text) TO anon;
GRANT ALL ON FUNCTION public.update_password(p_new_password text) TO authenticated;
GRANT ALL ON FUNCTION public.update_password(p_new_password text) TO service_role;


--
-- Name: FUNCTION update_user_profile(p_user_id uuid, p_nom text, p_role text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_user_profile(p_user_id uuid, p_nom text, p_role text) TO anon;
GRANT ALL ON FUNCTION public.update_user_profile(p_user_id uuid, p_nom text, p_role text) TO authenticated;
GRANT ALL ON FUNCTION public.update_user_profile(p_user_id uuid, p_nom text, p_role text) TO service_role;


--
-- Name: FUNCTION upsert_conducteurs(p_conducteurs jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.upsert_conducteurs(p_conducteurs jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_conducteurs(p_conducteurs jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_conducteurs(p_conducteurs jsonb) TO service_role;


--
-- Name: FUNCTION upsert_conducteurs(p_company_id text, p_conducteurs jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.upsert_conducteurs(p_company_id text, p_conducteurs jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_conducteurs(p_company_id text, p_conducteurs jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_conducteurs(p_company_id text, p_conducteurs jsonb) TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: SEQUENCE chantiers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.chantiers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.chantiers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.chantiers_id_seq TO service_role;


--
-- Name: TABLE companies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.companies TO anon;
GRANT ALL ON TABLE public.companies TO authenticated;
GRANT ALL ON TABLE public.companies TO service_role;


--
-- Name: SEQUENCE conducteurs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.conducteurs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.conducteurs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.conducteurs_id_seq TO service_role;


--
-- Name: SEQUENCE conges_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.conges_id_seq TO anon;
GRANT ALL ON SEQUENCE public.conges_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.conges_id_seq TO service_role;


--
-- Name: SEQUENCE custom_feries_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.custom_feries_id_seq TO anon;
GRANT ALL ON SEQUENCE public.custom_feries_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.custom_feries_id_seq TO service_role;


--
-- Name: SEQUENCE equipes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.equipes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.equipes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.equipes_id_seq TO service_role;


--
-- Name: TABLE personal_plan_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.personal_plan_items TO anon;
GRANT ALL ON TABLE public.personal_plan_items TO authenticated;
GRANT ALL ON TABLE public.personal_plan_items TO service_role;


--
-- Name: SEQUENCE personal_plan_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.personal_plan_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.personal_plan_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.personal_plan_items_id_seq TO service_role;


--
-- Name: TABLE personal_plan_rows; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.personal_plan_rows TO anon;
GRANT ALL ON TABLE public.personal_plan_rows TO authenticated;
GRANT ALL ON TABLE public.personal_plan_rows TO service_role;


--
-- Name: SEQUENCE personal_plan_rows_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.personal_plan_rows_id_seq TO anon;
GRANT ALL ON SEQUENCE public.personal_plan_rows_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.personal_plan_rows_id_seq TO service_role;


--
-- Name: TABLE personal_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.personal_plans TO anon;
GRANT ALL ON TABLE public.personal_plans TO authenticated;
GRANT ALL ON TABLE public.personal_plans TO service_role;


--
-- Name: SEQUENCE personal_plans_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.personal_plans_id_seq TO anon;
GRANT ALL ON SEQUENCE public.personal_plans_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.personal_plans_id_seq TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE types_chantier; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.types_chantier TO anon;
GRANT ALL ON TABLE public.types_chantier TO authenticated;
GRANT ALL ON TABLE public.types_chantier TO service_role;


--
-- Name: SEQUENCE types_chantier_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.types_chantier_id_seq TO anon;
GRANT ALL ON SEQUENCE public.types_chantier_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.types_chantier_id_seq TO service_role;


--
-- Name: TABLE user_companies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_companies TO anon;
GRANT ALL ON TABLE public.user_companies TO authenticated;
GRANT ALL ON TABLE public.user_companies TO service_role;


--
-- Name: TABLE vendeurs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.vendeurs TO anon;
GRANT ALL ON TABLE public.vendeurs TO authenticated;
GRANT ALL ON TABLE public.vendeurs TO service_role;


--
-- Name: SEQUENCE vendeurs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.vendeurs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.vendeurs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.vendeurs_id_seq TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2026_09_08; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_09_08 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_09_08 TO dashboard_user;


--
-- Name: TABLE messages_2026_09_09; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_09_09 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_09_09 TO dashboard_user;


--
-- Name: TABLE messages_2026_09_10; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_09_10 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_09_10 TO dashboard_user;


--
-- Name: TABLE messages_2026_09_11; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_09_11 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_09_11 TO dashboard_user;


--
-- Name: TABLE messages_2026_09_12; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_09_12 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_09_12 TO dashboard_user;


--
-- Name: TABLE messages_2026_09_13; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_09_13 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_09_13 TO dashboard_user;


--
-- Name: TABLE messages_2026_09_14; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_09_14 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_09_14 TO dashboard_user;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict z5DBOAKgAhVOlXCZ6PNVxDxFPRVbJqueRTTB5oZNqJG0Fhph4IqEXgK1GILYQV9

