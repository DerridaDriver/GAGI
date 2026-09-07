begin;

create extension if not exists pgcrypto;

create table if not exists public.candidates (
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

create index if not exists candidates_created_at_idx
  on public.candidates (created_at desc);

alter table public.candidates enable row level security;

revoke all on table public.candidates from anon, authenticated;
grant select, insert, update, delete on table public.candidates to service_role;

insert into public.candidates (
  generation_id,
  display_slot,
  text,
  provider,
  model,
  thinking_mode,
  prompt_version,
  source_slot,
  created_at
)
select
  generation.id,
  legacy.display_slot,
  legacy.text,
  generation.provider,
  generation.model,
  generation.thinking_mode,
  generation.prompt_version,
  legacy.display_slot,
  generation.created_at
from public.generations as generation
cross join lateral (
  values
    ('A', generation.joke_a),
    ('B', generation.joke_b),
    ('C', generation.joke_c),
    ('D', generation.joke_d)
) as legacy(display_slot, text)
where generation.prompt_version in ('writer_v1', 'writer_v2', 'writer_v2.1')
on conflict (generation_id, display_slot) do nothing;

commit;
