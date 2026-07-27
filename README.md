# New-ABSS

## Cloudflare D1 Business Storage

The admin business data layer uses Cloudflare D1 when the `ABSS_DB` binding is available. The existing `ABSS_ADMIN` Workers KV binding must remain connected as a migration backup and temporary fallback.

### Create and Bind D1

1. In Cloudflare, create a D1 database named `ABSS-Website-DB`.
2. In the Cloudflare Pages project, add a D1 binding:
   - Variable/binding name: `ABSS_DB`
   - Database: `ABSS-Website-DB`
3. Keep the existing KV binding:
   - Binding name: `ABSS_ADMIN`
4. Keep existing secrets unchanged:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`

### Apply Migrations

Apply the SQL in:

```sh
npx wrangler d1 migrations apply ABSS-Website-DB
```

For local testing with Wrangler:

```sh
npx wrangler d1 migrations apply ABSS-Website-DB --local
```

The first migration file is:

```txt
migrations/0001_create_abss_database.sql
```

The second migration removes only known development/demo admin records from D1 so dashboard totals match visible real leads:

```txt
migrations/0002_remove_stale_demo_data.sql
```

### Production KV to D1 Migration

After deployment and after `ABSS_DB` is bound, log in to the secure Admin Dashboard and use the Storage section button:

```txt
Migrate KV Data to D1
```

The migration reads `admin-state.json` from `ABSS_ADMIN`, inserts records into D1 with idempotent inserts, writes completion metadata to `app_metadata`, and does not delete or reset the KV data.

### Rollback

Do not delete the `ABSS_ADMIN` KV namespace. If D1 needs to be temporarily disconnected, remove or disable the `ABSS_DB` binding and the API will use the KV fallback. Reconnect `ABSS_DB` after the issue is fixed.
