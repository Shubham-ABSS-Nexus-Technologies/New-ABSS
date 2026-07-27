# Backend Connection Guide

Current local backend: dependency-free Node server.

Run locally:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Local backend features:

- `POST /api/auth/login`
- `GET /api/admin/state`
- `PUT /api/admin/state`
- `POST /api/leads/contact`
- Static file serving
- JSON database at `backend/data/db.json`

Production backend: Cloudflare Pages Functions with Cloudflare KV.

## Cloudflare Setup

Deploy this repository with Cloudflare Pages:

```text
Build command: npm run build
Build output directory: dist
Functions directory: functions
```

Create one KV namespace in Cloudflare:

```text
ABSS Nexus Admin
```

Bind that KV namespace to the Pages project with this variable name:

```text
ABSS_ADMIN
```

Add these Pages environment variables:

```text
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-strong-password
AUTH_SECRET=generate-a-long-random-secret
```

The Cloudflare API lives here:

```text
functions/api/[[path]].js
```

Production API routes:

- `POST /api/auth/login`
- `GET /api/admin/state`
- `PUT /api/admin/state`
- `POST /api/leads/contact`

Admin and contact form data is stored in the `ABSS_ADMIN` KV namespace under `admin-state.json`.

## Test After Deploy

1. Open `/admin-login.html`.
2. Log in with the Cloudflare environment credentials.
3. Submit the public contact form.
4. Confirm the new lead appears in the admin dashboard.
