-- Ajoute la colonne note manquante sur personal_plan_items (PGRST204)
alter table public.personal_plan_items
  add column if not exists note text not null default '';

-- recharge le cache PostgREST
notify pgrst, 'reload schema';
