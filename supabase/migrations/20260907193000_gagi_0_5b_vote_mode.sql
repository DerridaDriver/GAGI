begin;

alter table public.votes
  add column if not exists mode text;

update public.votes
set mode = 'ask'
where mode is null;

alter table public.votes
  alter column mode set default 'ask';

alter table public.votes
  alter column mode set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'votes_mode_allowed'
      and conrelid = 'public.votes'::regclass
  ) then
    alter table public.votes
      add constraint votes_mode_allowed
      check (mode in ('ask', 'arena'));
  end if;
end
$$;

commit;
