-- SSBUDLE — Arcade Run mode (Sudden Death / Lives / Time Attack) global
-- leaderboard. Additive to smashdle_schema.sql — run once in the Supabase
-- SQL editor after the base schema is in place. Safe to re-run: uses
-- `create or replace` / `if not exists` throughout.

-- ------------------------------------------------------------------------
-- Table: one row per completed run.
-- ------------------------------------------------------------------------
create table if not exists public.arcade_runs (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  variant text not null check (variant = any (array['sudden_death'::text, 'lives'::text, 'time_attack'::text])),
  fighters integer not null,
  points integer not null,
  ended_reason text not null check (ended_reason = any (array['dead'::text, 'time'::text, 'quit'::text])),
  created_at timestamp with time zone not null default now(),
  constraint arcade_runs_pkey primary key (id),
  constraint arcade_runs_user_id_fkey foreign key (user_id) references auth.users (id),
  -- Sanity bounds matching the client's scoring curve (25–100 pts per
  -- solved fighter); rejects obviously-tampered submissions without
  -- needing full server-side replay of the run.
  constraint arcade_runs_fighters_range check (fighters >= 0 and fighters <= 500),
  constraint arcade_runs_points_range check (points between fighters * 25 and fighters * 100)
);

create index if not exists arcade_runs_variant_user_idx
  on public.arcade_runs (variant, user_id);

alter table public.arcade_runs enable row level security;

drop policy if exists "Users can view their own runs" on public.arcade_runs;
create policy "Users can view their own runs"
  on public.arcade_runs for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy for authenticated/anon: every write goes
-- through submit_arcade_run() below, which runs as SECURITY DEFINER and
-- bypasses RLS. This keeps "insert as someone else" impossible even though
-- the tallied fighters/points themselves are client-reported.

-- ------------------------------------------------------------------------
-- RPC: submit_arcade_run — records a finished run for the signed-in user.
-- ------------------------------------------------------------------------
create or replace function public.submit_arcade_run(
  p_variant text,
  p_fighters integer,
  p_points integer,
  p_ended_reason text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'must be signed in to submit a run';
  end if;

  if p_variant not in ('sudden_death', 'lives', 'time_attack') then
    raise exception 'invalid variant: %', p_variant;
  end if;

  if p_ended_reason not in ('dead', 'time', 'quit') then
    raise exception 'invalid ended_reason: %', p_ended_reason;
  end if;

  if p_fighters < 0 or p_fighters > 500 then
    raise exception 'implausible fighters value: %', p_fighters;
  end if;

  if p_points < p_fighters * 25 or p_points > p_fighters * 100 then
    raise exception 'implausible points value: % for % fighters', p_points, p_fighters;
  end if;

  insert into public.arcade_runs (user_id, variant, fighters, points, ended_reason)
  values (auth.uid(), p_variant, p_fighters, p_points, p_ended_reason);
end;
$$;

grant execute on function public.submit_arcade_run(text, integer, integer, text) to authenticated;

-- ------------------------------------------------------------------------
-- View: leaderboard_arcade_runs — each player's single best run per
-- variant (fighters desc, points desc as tiebreak — not independently
-- maxed columns, so the pair always reflects one real attempt).
-- ------------------------------------------------------------------------
create or replace view public.leaderboard_arcade_runs as
select
  best.variant,
  rank() over (
    partition by best.variant
    order by best.fighters desc, best.points desc
  ) as rank,
  p.username,
  best.fighters,
  best.points
from (
  select distinct on (ar.variant, ar.user_id)
    ar.variant,
    ar.user_id,
    ar.fighters,
    ar.points
  from public.arcade_runs ar
  order by ar.variant, ar.user_id, ar.fighters desc, ar.points desc, ar.created_at desc
) best
join public.profiles p on p.id = best.user_id
order by best.variant, rank;

grant select on public.leaderboard_arcade_runs to anon, authenticated;
