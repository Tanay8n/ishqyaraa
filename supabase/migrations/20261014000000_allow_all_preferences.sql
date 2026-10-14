-- Migration: Allow all preferences to send likes/connection requests
-- Preference does not block connection requests (friendship can like dating, etc.)

create or replace function public.record_interaction (p_action text, p_target_id uuid) returns jsonb language plpgsql security definer
set
  search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_me public.profiles;
  v_target public.profiles;
  v_low uuid;
  v_high uuid;
  v_match_id uuid;
  v_conversation_id uuid;
  v_previous public.user_actions;
  v_created_match boolean := false;
begin
  if v_uid is null then raise exception 'Sign in to continue.' using errcode = '28000'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text, 1));

  if p_action = 'rewind' then
    select * into v_previous from public.user_actions where user_id = v_uid for update;
    if not found then return jsonb_build_object('restoredUid', null, 'blockedBecauseMatch', false); end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        least(v_uid, v_previous.target_id)::text || ':' || greatest(v_uid, v_previous.target_id)::text,
        0
      )
    );

    if v_previous.action = 'like' and v_previous.created_match then
      return jsonb_build_object('restoredUid', v_previous.target_id, 'blockedBecauseMatch', true);
    end if;

    if exists (
      select 1
      from public.matches m
      where m.user_low = least(v_uid, v_previous.target_id)
        and m.user_high = greatest(v_uid, v_previous.target_id)
        and m.status = 'active'
    ) then
      return jsonb_build_object('restoredUid', v_previous.target_id, 'blockedBecauseMatch', true);
    end if;

    if v_previous.action = 'like' then
      delete from public.likes where user_id=v_uid and target_id=v_previous.target_id;
    else
      delete from public.passes where user_id=v_uid and target_id=v_previous.target_id;
    end if;

    delete from public.user_actions where user_id = v_uid;

    return jsonb_build_object('restoredUid', v_previous.target_id, 'blockedBecauseMatch', false);
  end if;

  if p_action not in ('like','pass') or p_target_id is null or p_target_id = v_uid then
    raise exception 'Invalid action or target.' using errcode='22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      least(v_uid,p_target_id)::text || ':' || greatest(v_uid,p_target_id)::text,
      0
    )
  );

  select * into v_me from public.profiles where id=v_uid and profile_complete;
  select * into v_target from public.profiles where id=p_target_id and profile_complete;

  if v_me.id is null or v_target.id is null then raise exception 'This profile is unavailable.' using errcode='P0002'; end if;

  if exists (
    select 1
    from public.blocks b
    where (b.blocker_id=v_uid and b.blocked_id=p_target_id)
       or (b.blocker_id=p_target_id and b.blocked_id=v_uid)
  ) then
    raise exception 'This profile is unavailable.' using errcode='42501';
  end if;

  -- All connection preferences (dating, friendship, etc.) can send likes and connect with each other.

  if p_action = 'pass' then
    if exists (
      select 1
      from public.matches m
      where m.user_low=least(v_uid,p_target_id)
        and m.user_high=greatest(v_uid,p_target_id)
        and m.status='active'
    ) then
      raise exception 'You already have an active match with this person.' using errcode='23505';
    end if;

    delete from public.likes where user_id=v_uid and target_id=p_target_id;

    insert into public.passes(user_id,target_id)
    values(v_uid,p_target_id)
    on conflict (user_id, target_id) do update set created_at=now();

  else
    delete from public.passes where user_id=v_uid and target_id=p_target_id;

    insert into public.likes(user_id,target_id)
    values(v_uid,p_target_id)
    on conflict (user_id, target_id) do nothing;

    if exists (
      select 1
      from public.likes
      where user_id=p_target_id and target_id=v_uid
    ) then
      v_low := least(v_uid,p_target_id);
      v_high := greatest(v_uid,p_target_id);

      insert into public.matches(user_low,user_high)
      values(v_low,v_high)
      on conflict (user_low,user_high) do update set status='active'
      returning id into v_match_id;

      v_created_match := true;

      insert into public.conversations(match_id)
      values(v_match_id)
      on conflict (match_id) do update set match_id=excluded.match_id
      returning id into v_conversation_id;

      insert into public.conversation_members(conversation_id,user_id)
      values (v_conversation_id,v_low),(v_conversation_id,v_high)
      on conflict do nothing;
    end if;
  end if;

  insert into public.user_actions(user_id,action,target_id,created_match)
  values(v_uid,p_action,p_target_id,v_created_match)
  on conflict (user_id) do update set
    action=excluded.action,
    target_id=excluded.target_id,
    created_match=excluded.created_match,
    created_at=now();

  return jsonb_build_object('matched',v_created_match,'matchId',v_match_id,'already',false);
end;
$$;
