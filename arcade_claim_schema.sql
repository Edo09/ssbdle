-- SSBUDLE — Arcade Endless: retroactive sign-in attribution.
--
-- Problem: arcade_rounds.user_id is captured once (at start_arcade_round)
-- and never revisited by check_arcade_guess, so a guest's round can never
-- be credited to an account — even if they sign in before the round ends.
-- This patches both cases:
--   1. Mid-round: check_arcade_guess now backfills user_id from auth.uid()
--      if the round hasn't been claimed yet, so a guess made after signing
--      in (before the round ends) attributes and credits normally.
--   2. Already finished: a new claim_arcade_round() RPC lets the client
--      claim a just-finished anonymous round after sign-in, applying the
--      same stats crediting check_arcade_guess would have applied at
--      solve-time.
--
-- Run once in the Supabase SQL editor, after the base schema. Safe to
-- re-run (CREATE OR REPLACE throughout).

create or replace function public.check_arcade_guess(p_round_id uuid, p_character_id integer)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare r public.arcade_rounds; res jsonb; is_correct boolean;
begin
  select * into r from public.arcade_rounds where id = p_round_id;
  if r.id is null then raise exception 'Unknown arcade round'; end if;

  -- Backfill attribution: if this round started anonymously and the
  -- caller is now signed in, claim it before evaluating the guess.
  if r.user_id is null and auth.uid() is not null then
    update public.arcade_rounds set user_id = auth.uid() where id = r.id;
    r.user_id := auth.uid();
  end if;

  res := public.compare_characters(p_character_id, r.target_id);
  is_correct := (res->>'correct')::boolean;

  if not r.finished then
    update public.arcade_rounds
      set guesses = guesses + 1,
          solved  = is_correct,
          finished = is_correct
      where id = r.id;

    if is_correct and r.user_id is not null then
      insert into public.player_stats (user_id) values (r.user_id) on conflict (user_id) do nothing;
      update public.player_stats st set
        arcade_played = st.arcade_played + 1,
        arcade_wins   = st.arcade_wins + 1,
        arcade_best_guesses = least(coalesce(st.arcade_best_guesses, 2147483647), r.guesses + 1),
        updated_at = now()
      where st.user_id = r.user_id;
    end if;
  end if;

  return res || jsonb_build_object('round_id', r.id, 'guesses', r.guesses + (case when r.finished then 0 else 1 end));
end;
$function$;

-- ------------------------------------------------------------------------
-- RPC: claim_arcade_round — retroactively attributes an already-finished
-- anonymous round to the now-signed-in caller, crediting stats on a win.
-- No-op if the round doesn't exist, is already attributed to someone, or
-- is still in progress (that case self-heals via check_arcade_guess above
-- the next time a guess is submitted).
-- ------------------------------------------------------------------------
create or replace function public.claim_arcade_round(p_round_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r public.arcade_rounds;
begin
  if auth.uid() is null then
    raise exception 'must be signed in to claim a round';
  end if;

  select * into r from public.arcade_rounds where id = p_round_id;
  if r.id is null or r.user_id is not null or not r.finished then
    return;
  end if;

  update public.arcade_rounds set user_id = auth.uid() where id = p_round_id;

  if r.solved then
    insert into public.player_stats (user_id) values (auth.uid()) on conflict (user_id) do nothing;
    update public.player_stats st set
      arcade_played = st.arcade_played + 1,
      arcade_wins   = st.arcade_wins + 1,
      arcade_best_guesses = least(coalesce(st.arcade_best_guesses, 2147483647), r.guesses),
      updated_at = now()
    where st.user_id = auth.uid();
  end if;
end;
$$;

grant execute on function public.claim_arcade_round(uuid) to authenticated;
