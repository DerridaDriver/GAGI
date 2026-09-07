begin;

create extension if not exists pgcrypto;

create table if not exists public.generation_requests (
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

create index if not exists generation_requests_created_at_idx
  on public.generation_requests (created_at desc);

create index if not exists generation_requests_session_created_at_idx
  on public.generation_requests (session_id, created_at desc);

create index if not exists generation_requests_ip_created_at_idx
  on public.generation_requests (ip_hash, created_at desc);

alter table public.generation_requests enable row level security;

revoke all on table public.generation_requests from anon, authenticated;
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
