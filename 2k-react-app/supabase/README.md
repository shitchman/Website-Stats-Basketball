# Supabase setup

This directory contains the Supabase CLI configuration and the initial PostgreSQL schema for the app. The FastAPI backend remains the database client: it connects to Supabase PostgreSQL through `Backend/.env` and SQLAlchemy.

## Hosted Supabase project

1. In the Supabase dashboard, open the project and copy its PostgreSQL connection string.
2. Put the connection string in `Backend/.env` as `DATABASE_URL`. Keep the password URL-encoded.
3. Use the session pooler connection (normally port `5432`) with `sslmode=require`, which works with the current `psycopg` dependency.
4. Apply the migration from the repository root:

```powershell
supabase link --project-ref <your-project-ref>
supabase db push
```

The project ref is the subdomain in `https://<project-ref>.supabase.co`. Do not commit access tokens or database passwords.

## Local Supabase

Install Docker Desktop and the Supabase CLI, then run from the repository root:

```powershell
supabase start
supabase db reset
```

For local development, set `Backend/.env` to the local database URL printed by `supabase start`, and use the local API URL and publishable key in `Frontend/.env` if the frontend needs to call Supabase directly.

The existing frontend client requires these variables:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

The current application authentication and database access are handled by FastAPI, not Supabase Auth. Do not enable frontend Supabase Auth flows unless the backend authentication design is intentionally migrated.

## Existing hosted database

The current hosted database already has the application tables, but its `supabase_migrations.schema_migrations` table has not been initialized. The tables were created outside the Supabase CLI, so mark the initial schema as applied before pushing migrations. Otherwise, the initial migration will try to create tables that already exist.

Run these commands once from the repository root after linking the hosted project:

```powershell
supabase migration repair 20260911000000 --status applied
supabase db push
```

The second command applies `20260911000100_seed_game_modes.sql`, which safely inserts or updates the 11 fixed game-mode IDs and advances their identity sequence. Verify the result in the Supabase SQL Editor:

```sql
select id, mode_name
from public.game_modes
order by id;
```

Use migration repair only for this existing database. A new database should apply the complete migration history normally with `supabase db push`.
