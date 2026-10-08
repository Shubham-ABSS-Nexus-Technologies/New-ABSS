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
Deploy command: leave blank
```

### 1. D1 Database Binding (Primary Database)

In Cloudflare Dashboard -> **Compute (Workers & Pages)** -> **Pages** -> Your Project (`new-abss`) -> **Settings** -> **Functions** -> **D1 database bindings**:

- Click **Add binding**
- **Variable name**: `ABSS_DB`
- **D1 database**: `abss-website-db` (ID: `dd88bed8-1506-4274-b932-16cd2608c8ec`)

To run migrations from your terminal:
```bash
npx wrangler d1 migrations apply abss-website-db --remote --config wrangler.d1.jsonc
```

### 2. KV Namespace Binding (Fallback Storage)

In **Settings** -> **Functions** -> **KV namespace bindings**:

- Click **Add binding**
- **Variable name**: `ABSS_ADMIN`
- **KV namespace**: `ABSS Nexus Admin`

### 3. Environment Variables

In **Settings** -> **Environment variables** (Add under both **Production** and **Preview**):

| Variable Name | Description | Example / Instructions |
|---|---|---|
| `ADMIN_USERNAME` | Admin panel login username | `admin` |
| `ADMIN_PASSWORD` | Strong password for admin panel | *Generate a strong password* |
| `AUTH_SECRET` | 64-char random string for session tokens | Run: `openssl rand -hex 32` |
| `TURNSTILE_SECRET_KEY` | *(Optional)* Cloudflare Turnstile secret key | Found in Cloudflare Turnstile dashboard |

> 💡 See [.env.example](file:///Users/shubhamkumar/New-ABSS-Deploy/.env.example) for a local reference file.

### 4. Cloudflare Turnstile Bot Protection (Optional)

1. Go to Cloudflare Dashboard -> **Turnstile** -> **Add Site**.
2. Domain: `abssnexus.in` (add `localhost` for local testing).
3. Widget mode: **Managed** (or **Non-interactive**).
4. Copy the **Site Key** and add it to the contact form script/html:
   ```html
   <div class="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>
   ```
5. Add the **Secret Key** in Cloudflare Pages Environment Variables as `TURNSTILE_SECRET_KEY`.
6. Submissions will automatically be validated on the backend before creating leads.

---

The Cloudflare API lives here:

```text
functions/api/[[path]].js
```

Production API routes:

- `POST /api/auth/login`
- `GET /api/admin/state`
- `PUT /api/admin/state`
- `POST /api/leads/contact`
- `GET /api/d1/leads`
- `DELETE /api/d1/leads/:id`
- `GET /api/d1/users`
- `DELETE /api/d1/users/:id`

## Test After Deploy

1. Open `/admin-login.html`.
2. Log in with the Cloudflare environment credentials.
3. Submit the public contact form on `/contact` or the home page.
4. Confirm the new lead appears in the admin dashboard.
