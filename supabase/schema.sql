begin;

create extension if not exists pgcrypto;

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  darkness smallint not null,
  absurdity smallint not null,
  vulgarity smallint not null,
  joke_a text not null,
  joke_b text not null,
  joke_c text not null,
  joke_d text not null,
  provider text not null,
  model text not null,
  thinking_mode text not null,
  prompt_version text not null,
  latency_ms integer,
  created_at timestamptz not null default now(),
  constraint generations_darkness_range check (darkness between 0 and 10),
  constraint generations_absurdity_range check (absurdity between 0 and 10),
  constraint generations_vulgarity_range check (vulgarity between 0 and 10),
  constraint generations_latency_nonnegative check (
    latency_ms is null or latency_ms >= 0
  )
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  display_slot text not null,
  text text not null,
  provider text not null,
  model text not null,
  thinking_mode text not null,
  prompt_version text not null,
  source_slot text not null,
  created_at timestamptz not null default now(),
  constraint candidates_display_slot_allowed check (
    display_slot in ('A', 'B', 'C', 'D')
  ),
  constraint candidates_source_slot_allowed check (
    source_slot in ('A', 'B', 'C', 'D')
  ),
  constraint candidates_generation_display_slot_unique unique (
    generation_id,
    display_slot
  )
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations(id) on delete cascade,
  session_id uuid not null,
  choice text not null,
  mode text not null default 'ask',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint votes_choice_allowed check (
    choice in ('A', 'B', 'C', 'D', 'ALL_BAD')
  ),
  constraint votes_mode_allowed check (
    mode in ('ask', 'arena')
  ),
  constraint votes_generation_session_unique unique (generation_id, session_id)
);

create table public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  ip_hash text not null,
  status text not null default 'started',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  failure_type text,
  constraint generation_requests_ip_hash_format check (
    ip_hash ~ '^[0-9a-f]{64}$'
  ),
  constraint generation_requests_status_allowed check (
    status in ('started', 'success', 'failed')
  )
);

create index generations_created_at_idx
  on public.generations (created_at desc);

create index candidates_created_at_idx
  on public.candidates (created_at desc);

create index votes_created_at_idx
  on public.votes (created_at desc);

create index generation_requests_created_at_idx
  on public.generation_requests (created_at desc);

create index generation_requests_session_created_at_idx
  on public.generation_requests (session_id, created_at desc);

create index generation_requests_ip_created_at_idx
  on public.generation_requests (ip_hash, created_at desc);

create or replace function public.gagi_set_vote_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger votes_set_updated_at
before update on public.votes
for each row
execute function public.gagi_set_vote_updated_at();

alter table public.generations enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;
alter table public.generation_requests enable row level security;

revoke all on table public.generations from anon, authenticated;
revoke all on table public.candidates from anon, authenticated;
revoke all on table public.votes from anon, authenticated;
revoke all on table public.generation_requests from anon, authenticated;

grant select, insert, update, delete on table public.generations to service_role;
grant select, insert, update, delete on table public.candidates to service_role;
grant select, insert, update, delete on table public.votes to service_role;
grant select, insert, update, delete
  on table public.generation_requests
  to service_role;

create or replace function public.claim_generation_request(
  p_session_id uuid,
  p_ip_hash text,
  p_session_10m_limit integer,
  p_session_24h_limit integer,
  p_ip_10m_limit integer,
  p_ip_24h_limit integer,
  p_global_24h_limit integer
)
returns table (
  allowed boolean,
  reason text,
  retry_after_seconds integer,
  request_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_count bigint;
begin
  if p_session_id is null then
    raise exception 'session_id is required';
  end if;

  if p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'ip_hash format is invalid';
  end if;

  if least(
    p_session_10m_limit,
    p_session_24h_limit,
    p_ip_10m_limit,
    p_ip_24h_limit,
    p_global_24h_limit
  ) < 1 then
    raise exception 'rate limits must be positive';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('gagi_generation_quota', 0)
  );

  select count(*)
  into v_count
  from public.generation_requests
  where session_id = p_session_id
    and created_at >= v_now - interval '10 minutes';

  if v_count >= p_session_10m_limit then
    allowed := false;
    reason := 'SESSION_10M';
    select greatest(
      1,
      ceil(extract(epoch from (
        min(created_at) + interval '10 minutes' - v_now
      )))::integer
    )
    into retry_after_seconds
    from public.generation_requests
    where session_id = p_session_id
      and created_at >= v_now - interval '10 minutes';
    request_id := null;
    return next;
    return;
  end if;

  select count(*)
  into v_count
  from public.generation_requests
  where session_id = p_session_id
    and created_at >= v_now - interval '24 hours';

  if v_count >= p_session_24h_limit then
    allowed := false;
    reason := 'SESSION_24H';
    select greatest(
      1,
      ceil(extract(epoch from (
        min(created_at) + interval '24 hours' - v_now
      )))::integer
    )
    into retry_after_seconds
    from public.generation_requests
    where session_id = p_session_id
      and created_at >= v_now - interval '24 hours';
    request_id := null;
    return next;
    return;
  end if;

  select count(*)
  into v_count
  from public.generation_requests
  where ip_hash = p_ip_hash
    and created_at >= v_now - interval '10 minutes';

  if v_count >= p_ip_10m_limit then
    allowed := false;
    reason := 'IP_10M';
    select greatest(
      1,
      ceil(extract(epoch from (
        min(created_at) + interval '10 minutes' - v_now
      )))::integer
    )
    into retry_after_seconds
    from public.generation_requests
    where ip_hash = p_ip_hash
      and created_at >= v_now - interval '10 minutes';
    request_id := null;
    return next;
    return;
  end if;

  select count(*)
  into v_count
  from public.generation_requests
  where ip_hash = p_ip_hash
    and created_at >= v_now - interval '24 hours';

  if v_count >= p_ip_24h_limit then
    allowed := false;
    reason := 'IP_24H';
    select greatest(
      1,
      ceil(extract(epoch from (
        min(created_at) + interval '24 hours' - v_now
      )))::integer
    )
    into retry_after_seconds
    from public.generation_requests
    where ip_hash = p_ip_hash
      and created_at >= v_now - interval '24 hours';
    request_id := null;
    return next;
    return;
  end if;

  select count(*)
  into v_count
  from public.generation_requests
  where created_at >= v_now - interval '24 hours';

  if v_count >= p_global_24h_limit then
    allowed := false;
    reason := 'GLOBAL_24H';
    select greatest(
      1,
      ceil(extract(epoch from (
        min(created_at) + interval '24 hours' - v_now
      )))::integer
    )
    into retry_after_seconds
    from public.generation_requests
    where created_at >= v_now - interval '24 hours';
    request_id := null;
    return next;
    return;
  end if;

  insert into public.generation_requests (
    session_id,
    ip_hash,
    status
  )
  values (
    p_session_id,
    p_ip_hash,
    'started'
  )
  returning id into request_id;

  allowed := true;
  reason := null;
  retry_after_seconds := null;
  return next;
end;
$$;

revoke all on function public.claim_generation_request(
  uuid,
  text,
  integer,
  integer,
  integer,
  integer,
  integer
) from public, anon, authenticated;

grant execute on function public.claim_generation_request(
  uuid,
  text,
  integer,
  integer,
  integer,
  integer,
  integer
) to service_role;

commit;
