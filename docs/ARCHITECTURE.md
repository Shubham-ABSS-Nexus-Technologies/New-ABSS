# Architecture

The project is being migrated from a flat static website into a separated production structure.

## Current Live Layer

Root HTML files are now compatibility redirects only.

The real page files live in:

- `src/pages/`
- `src/admin/`
- `src/styles/`
- `src/scripts/`
- `src/config/`
- `src/services/`
- `public/assets/`

## Target Structure

```text
public/
  assets/
src/
  pages/
  admin/
  components/
  styles/
  scripts/
  config/
  services/
backend/
  api/
  auth/
  services/
database/
  migrations/
  seeds/
scripts/
tests/
docs/
```

## Frontend Responsibilities

- Render public marketing pages.
- Render admin pages.
- Handle client-side UI behavior.
- Call service layer for data/auth.

## Backend Responsibilities

- Authenticate admins.
- Validate form input.
- Store leads, projects, clients, tickets, pricing, and activity.
- Protect admin operations.

## Database Responsibilities

- Store business data.
- Enforce row-level security.
- Keep migrations versioned.

## Migration Rule

Do not move a live file unless every reference to it is updated in the same change.

Current root redirects are intentionally kept so old URLs such as `/index.html` and
`/admin-dashboard.html` continue to work.
