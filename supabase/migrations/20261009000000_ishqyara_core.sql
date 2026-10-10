-- IshqYara core schema. Apply only after reviewing; this migration is local and
-- is not applied to any hosted Supabase project by the app.
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  age smallint not null default 18 check (age between 18 and 130),
  college text not null default '',
  area text not null default '',
  bio text not null default '',
  tagline text not null default '',
  intention text not null default 'Friendship'
    check (intention in ('Dating','Friendship','Food Buddy','Puja Buddy','Photography Buddy')),
  looking_for text[] not null default array['Friendship']::text[],
  interests text[] not null default '{}',
  photo_urls text[] not null default '{}',
  puja_preferences jsonb not null default '{"crowdComfort":"Balanced Explorer","favoritePandalZone":"South Kolkata Theme","foodPriority":"Puchka & Rolls First","timing":"Sunset to Midnight (5 PM - 12 AM)"}'::jsonb,
  prompts jsonb not null default '[]'::jsonb,
  profile_complete boolean not null default false,
  college_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_looking_for_allowed check (looking_for <@ array['Dating','Friendship','Food Buddy','Puja Buddy','Photography Buddy']::text[]),
  constraint profiles_puja_preferences_object check (jsonb_typeof(puja_preferences) = 'object'),
  constraint profiles_prompts_array check (jsonb_typeof(prompts) = 'array')
);

create table public.profile_private (
  user_id uuid primary key references auth.users(id) on delete cascade,
  date_of_birth date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_id),
  check (user_id <> target_id)
);
create index likes_target_idx on public.likes(target_id, user_id);

create table public.passes (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_id),
  check (user_id <> target_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_low uuid not null references auth.users(id) on delete cascade,
  user_high uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  check (user_low < user_high),
  unique (user_low, user_high)
);
create index matches_user_high_idx on public.matches(user_high, status);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  last_sender_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unread_count integer not null default 0 check (unread_count >= 0),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);
create index conversation_members_user_idx on public.conversation_members(user_id, conversation_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at desc);

create table public.user_actions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  action text not null check (action in ('like','pass')),
  target_id uuid not null references auth.users(id) on delete cascade,
  created_match boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks(blocked_id, blocker_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  reported_id uuid references auth.users(id) on delete set null,
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now(),
  check (reporter_id is distinct from reported_id)
);

alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.likes enable row level security;
alter table public.passes enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.user_actions enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

create policy "completed profiles visible to signed-in users; own draft visible"
  on public.profiles for select to authenticated
  using (profile_complete or id = (select auth.uid()));
create policy "read own private profile" on public.profile_private for select to authenticated
  using (user_id = (select auth.uid()));
create policy "read own likes" on public.likes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "read own passes" on public.passes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "read own matches" on public.matches for select to authenticated
  using ((select auth.uid()) in (user_low, user_high));
create policy "read active conversations for own matches" on public.conversations for select to authenticated
  using (exists (
    select 1 from public.matches m
    where m.id = conversations.match_id and m.status = 'active'
      and (select auth.uid()) in (m.user_low, m.user_high)
      and not exists (select 1 from public.blocks b where
        (b.blocker_id = (select auth.uid()) and b.blocked_id = case when m.user_low = (select auth.uid()) then m.user_high else m.user_low end)
        or (b.blocked_id = (select auth.uid()) and b.blocker_id = case when m.user_low = (select auth.uid()) then m.user_high else m.user_low end))
  ));
create policy "read own conversation membership" on public.conversation_members for select to authenticated
  using (user_id = (select auth.uid()));
create policy "read messages in own active unblocked conversations" on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    join public.matches m on m.id = c.match_id
    where c.id = messages.conversation_id and m.status = 'active'
      and (select auth.uid()) in (m.user_low, m.user_high)
      and not exists (select 1 from public.blocks b where
        (b.blocker_id = (select auth.uid()) and b.blocked_id = case when m.user_low = (select auth.uid()) then m.user_high else m.user_low end)
        or (b.blocked_id = (select auth.uid()) and b.blocker_id = case when m.user_low = (select auth.uid()) then m.user_high else m.user_low end))
  ));
create policy "read own last action" on public.user_actions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "read blocks involving self" on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()) or blocked_id = (select auth.uid()));
create policy "submit reports as self" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and reported_id is not null);

revoke all on public.profiles, public.profile_private, public.likes, public.passes,
  public.matches, public.conversations, public.conversation_members, public.messages,
  public.user_actions, public.blocks, public.reports from public, anon, authenticated;
grant select on public.profiles, public.profile_private, public.likes, public.passes,
  public.matches, public.conversations, public.conversation_members, public.messages,
  public.user_actions, public.blocks to authenticated;
grant insert on public.reports to authenticated;

create or replace function public.save_my_profile(p_profile jsonb, p_date_of_birth date)
returns public.profiles
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_existing_dob date;
  v_age integer;
  v_profile public.profiles;
  v_allowed text[] := array['Dating','Friendship','Food Buddy','Puja Buddy','Photography Buddy']::text[];
begin
  if v_uid is null then raise exception 'Sign in to save your profile.' using errcode = '28000'; end if;
  -- Serialize first-time profile creation so private DOB and public age cannot
  -- diverge if two profile saves race for the same account.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text, 2));
  if p_date_of_birth is null or p_date_of_birth > (current_date - interval '18 years')::date then
    raise exception 'IshqYara is for adults aged 18 and above.' using errcode = '22023';
  end if;
  if p_profile is null or jsonb_typeof(p_profile) <> 'object' then
    raise exception 'Profile data is invalid.' using errcode = '22023';
  end if;
  select pp.date_of_birth into v_existing_dob from public.profile_private pp where pp.user_id = v_uid for update;
  if v_existing_dob is not null and v_existing_dob <> p_date_of_birth then
    raise exception 'Date of birth cannot be changed after profile creation.' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_profile->'photoURLs','null'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_profile->'lookingFor','null'::jsonb)) <> 'array'
    or (p_profile ? 'interests' and jsonb_typeof(p_profile->'interests') not in ('array','null'))
    or (p_profile ? 'prompts' and jsonb_typeof(p_profile->'prompts') not in ('array','null')) then
    raise exception 'Profile list fields are invalid.' using errcode = '22023';
  end if;
  if nullif(btrim(p_profile->>'displayName'), '') is null
    or nullif(btrim(p_profile->>'college'), '') is null
    or nullif(btrim(p_profile->>'area'), '') is null
    or not coalesce(p_profile->>'intention' = any(v_allowed), false)
    or jsonb_array_length(coalesce(p_profile->'photoURLs', '[]'::jsonb)) = 0
    or jsonb_array_length(coalesce(p_profile->'photoURLs', '[]'::jsonb)) > 4 then
    raise exception 'Complete the required profile fields and add at least one photo.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements_text(p_profile->'lookingFor') as items(value)
    where items.value is null or not (items.value = any(v_allowed)))
    or jsonb_array_length(coalesce(p_profile->'lookingFor', '[]'::jsonb)) = 0 then
    raise exception 'Choose at least one connection preference.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements_text(p_profile->'photoURLs') as items(value)
    where items.value is null or btrim(items.value) = ''
      or not (items.value like 'https://%' or items.value like 'profile-photos/' || v_uid::text || '/%')) then
    raise exception 'A profile photo is not a valid image reference.' using errcode = '22023';
  end if;
  v_age := extract(year from age(current_date, p_date_of_birth));
  insert into public.profile_private(user_id, date_of_birth)
    values (v_uid, p_date_of_birth)
    on conflict (user_id) do update set updated_at = now();
  insert into public.profiles(
    id, display_name, age, college, area, bio, tagline, intention,
    looking_for, interests, photo_urls, puja_preferences, prompts,
    profile_complete, updated_at
  ) values (
    v_uid, left(btrim(p_profile->>'displayName'),80), v_age,
    left(btrim(p_profile->>'college'),120), left(btrim(p_profile->>'area'),80),
    left(coalesce(p_profile->>'bio',''),600), left(coalesce(p_profile->>'tagline',''),140),
    p_profile->>'intention',
    array(select jsonb_array_elements_text(p_profile->'lookingFor')),
    array(select distinct left(btrim(x.value),50) from jsonb_array_elements_text(coalesce(nullif(p_profile->'interests','null'::jsonb),'[]'::jsonb)) as x(value) where btrim(x.value) <> '' limit 12),
    array(select jsonb_array_elements_text(p_profile->'photoURLs')),
    coalesce(p_profile->'pujaPreferences','{}'::jsonb),
    coalesce(nullif(p_profile->'prompts','null'::jsonb),'[]'::jsonb), true, now()
  ) on conflict (id) do update set
    display_name = excluded.display_name, age = excluded.age, college = excluded.college,
    area = excluded.area, bio = excluded.bio, tagline = excluded.tagline,
    intention = excluded.intention, looking_for = excluded.looking_for,
    interests = excluded.interests, photo_urls = excluded.photo_urls,
    puja_preferences = excluded.puja_preferences, prompts = excluded.prompts,
    profile_complete = true, updated_at = now()
  returning * into v_profile;
  return v_profile;
end;
$$;

create or replace function public.record_interaction(p_action text, p_target_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid(); v_me public.profiles; v_target public.profiles;
  v_low uuid; v_high uuid; v_match_id uuid; v_conversation_id uuid;
  v_previous public.user_actions; v_created_match boolean := false;
begin
  if v_uid is null then raise exception 'Sign in to continue.' using errcode = '28000'; end if;
  -- Keep a single well-defined latest action per caller, including rewind.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text, 1));
  if p_action = 'rewind' then
    select * into v_previous from public.user_actions where user_id = v_uid for update;
    if not found then return jsonb_build_object('restoredUid', null, 'blockedBecauseMatch', false); end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
      least(v_uid,v_previous.target_id)::text || ':' || greatest(v_uid,v_previous.target_id)::text, 0));
    if v_previous.action = 'like' and v_previous.created_match then
      return jsonb_build_object('restoredUid', v_previous.target_id, 'blockedBecauseMatch', true);
    end if;
    if exists(select 1 from public.matches m where m.user_low = least(v_uid,v_previous.target_id) and m.user_high = greatest(v_uid,v_previous.target_id) and m.status = 'active') then
      return jsonb_build_object('restoredUid', v_previous.target_id, 'blockedBecauseMatch', true);
    end if;
    if v_previous.action = 'like' then delete from public.likes where user_id=v_uid and target_id=v_previous.target_id;
    else delete from public.passes where user_id=v_uid and target_id=v_previous.target_id; end if;
    delete from public.user_actions where user_id = v_uid;
    return jsonb_build_object('restoredUid', v_previous.target_id, 'blockedBecauseMatch', false);
  end if;
  if p_action not in ('like','pass') or p_target_id is null or p_target_id = v_uid then raise exception 'Invalid action or target.' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    least(v_uid,p_target_id)::text || ':' || greatest(v_uid,p_target_id)::text, 0));
  select * into v_me from public.profiles where id=v_uid and profile_complete;
  select * into v_target from public.profiles where id=p_target_id and profile_complete;
  if v_me.id is null or v_target.id is null then raise exception 'This profile is unavailable.' using errcode='P0002'; end if;
  if exists(select 1 from public.blocks b where (b.blocker_id=v_uid and b.blocked_id=p_target_id) or (b.blocker_id=p_target_id and b.blocked_id=v_uid)) then raise exception 'This profile is unavailable.' using errcode='42501'; end if;
  if not (v_target.intention = any(v_me.looking_for)) or not (v_me.intention = any(v_target.looking_for)) then raise exception 'This profile does not match both users’ connection preferences.' using errcode='42501'; end if;
  if p_action = 'pass' then
    if exists(select 1 from public.matches m where m.user_low=least(v_uid,p_target_id) and m.user_high=greatest(v_uid,p_target_id) and m.status='active') then raise exception 'You already have an active match with this person.' using errcode='23505'; end if;
    delete from public.likes where user_id=v_uid and target_id=p_target_id;
    insert into public.passes(user_id,target_id) values(v_uid,p_target_id) on conflict do update set created_at=now();
  else
    delete from public.passes where user_id=v_uid and target_id=p_target_id;
    insert into public.likes(user_id,target_id) values(v_uid,p_target_id) on conflict do nothing;
    if exists(select 1 from public.likes where user_id=p_target_id and target_id=v_uid) then
      v_low := least(v_uid,p_target_id); v_high := greatest(v_uid,p_target_id);
      insert into public.matches(user_low,user_high) values(v_low,v_high)
        on conflict(user_low,user_high) do update set status='active' returning id into v_match_id;
      v_created_match := true;
      insert into public.conversations(match_id) values(v_match_id)
        on conflict(match_id) do update set match_id=excluded.match_id returning id into v_conversation_id;
      insert into public.conversation_members(conversation_id,user_id) values(v_conversation_id,v_low),(v_conversation_id,v_high) on conflict do nothing;
    end if;
  end if;
  insert into public.user_actions(user_id,action,target_id,created_match) values(v_uid,p_action,p_target_id,v_created_match)
    on conflict(user_id) do update set action=excluded.action,target_id=excluded.target_id,created_match=excluded.created_match,created_at=now();
  return jsonb_build_object('matched',v_created_match,'matchId',v_match_id,'already',false);
end;
$$;

create or replace function public.send_conversation_message(p_conversation_id uuid, p_body text)
returns public.messages language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid(); v_match public.matches; v_conversation public.conversations;
  v_other uuid; v_message public.messages; v_blocked boolean;
begin
  if v_uid is null then raise exception 'Sign in to send a message.' using errcode='28000'; end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 2000 then raise exception 'Enter a message of 1 to 2000 characters.' using errcode='22023'; end if;
  select c.* into v_conversation from public.conversations c where c.id=p_conversation_id for update;
  if not found then raise exception 'Conversation not found.' using errcode='P0002'; end if;
  select m.* into v_match from public.matches m where m.id=v_conversation.match_id for update;
  if not found or v_match.status <> 'active' or v_uid not in (v_match.user_low,v_match.user_high) then raise exception 'You cannot message this conversation.' using errcode='42501'; end if;
  v_other := case when v_match.user_low=v_uid then v_match.user_high else v_match.user_low end;
  select exists(select 1 from public.blocks b where (b.blocker_id=v_uid and b.blocked_id=v_other) or (b.blocker_id=v_other and b.blocked_id=v_uid)) into v_blocked;
  if v_blocked then raise exception 'Messaging is unavailable for this match.' using errcode='42501'; end if;
  insert into public.messages(conversation_id,sender_id,body) values(p_conversation_id,v_uid,btrim(p_body)) returning * into v_message;
  update public.conversations set last_message=left(btrim(p_body),140),last_message_at=v_message.created_at,last_sender_id=v_uid where id=p_conversation_id;
  update public.conversation_members set unread_count=unread_count+1 where conversation_id=p_conversation_id and user_id=v_other;
  return v_message;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Sign in to continue.' using errcode='28000'; end if;
  update public.conversation_members cm set unread_count=0,last_read_at=now()
    from public.conversations c join public.matches m on m.id=c.match_id
    where cm.conversation_id=c.id and cm.conversation_id=p_conversation_id and cm.user_id=v_uid
      and m.status='active' and v_uid in (m.user_low,m.user_high);
  if not found then raise exception 'You cannot access this conversation.' using errcode='42501'; end if;
end;
$$;

create or replace function public.block_user(p_target_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid(); v_conversation_id uuid;
begin
  if v_uid is null then raise exception 'Sign in to continue.' using errcode='28000'; end if;
  if p_target_id is null or p_target_id=v_uid then raise exception 'Invalid profile.' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    least(v_uid,p_target_id)::text || ':' || greatest(v_uid,p_target_id)::text, 0));
  insert into public.blocks(blocker_id,blocked_id) values(v_uid,p_target_id) on conflict do nothing;
  update public.matches set status='inactive' where user_low=least(v_uid,p_target_id) and user_high=greatest(v_uid,p_target_id);
  delete from public.conversation_members cm using public.conversations c, public.matches m
    where cm.conversation_id=c.id and c.match_id=m.id
      and m.user_low=least(v_uid,p_target_id) and m.user_high=greatest(v_uid,p_target_id);
end;
$$;

revoke all on function public.save_my_profile(jsonb,date) from public, anon;
revoke all on function public.record_interaction(text,uuid) from public, anon;
revoke all on function public.send_conversation_message(uuid,text) from public, anon;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
revoke all on function public.block_user(uuid) from public, anon;
grant execute on function public.save_my_profile(jsonb,date) to authenticated;
grant execute on function public.record_interaction(text,uuid) to authenticated;
grant execute on function public.send_conversation_message(uuid,text) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.block_user(uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('profile-photos','profile-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "signed-in users can view profile photos" on storage.objects for select to authenticated
  using (bucket_id='profile-photos' and (
    (storage.foldername(name))[1]=(select auth.uid())::text
    or exists (
      select 1 from public.profiles p
      where p.id::text=(storage.foldername(name))[1] and p.profile_complete
    )
  ));
create policy "users upload photos to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id='profile-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "users update photos in their own folder" on storage.objects for update to authenticated
  using (bucket_id='profile-photos' and (storage.foldername(name))[1]=(select auth.uid())::text)
  with check (bucket_id='profile-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "users delete photos in their own folder" on storage.objects for delete to authenticated
  using (bucket_id='profile-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);

alter table public.profiles replica identity full;
alter table public.matches replica identity full;
alter table public.conversation_members replica identity full;
alter table public.messages replica identity full;
alter publication supabase_realtime add table public.matches, public.conversation_members, public.messages;
