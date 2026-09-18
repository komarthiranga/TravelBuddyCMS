-- User-owned data only. No copy of Google's place content or master records.
create table if not exists traveller (
    id text primary key,
    name text not null,
    email text not null,
    created_at timestamptz not null default now()
);
create table if not exists traveller_place (
    user_id text not null references traveller(id) on delete cascade,
    provider text not null default 'google' check (provider = 'google'),
    place_id text not null,
    saved boolean not null default false,
    liked boolean not null default false,
    updated_at timestamptz not null default now(),
    primary key (user_id, provider, place_id)
);
