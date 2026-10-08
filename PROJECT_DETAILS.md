# ABSS Nexus Website - Full Project Details

Yeh document project ka complete overview hai. Iska goal hai ki koi bhi developer ya owner quickly samajh sake ki project kya karta hai, local par kaise run hota hai, production deployment kaise configured hai, aur important files kahan milengi.

## 1. Project Summary

Project name: `abss-nexus-website`

Description: ABSS Nexus Technologies ka corporate IT services website aur admin backend.

Tech stack:

- Frontend: Static HTML, CSS, JavaScript
- Local backend: Dependency-free Node.js HTTP server
- Production backend: Cloudflare Pages Functions
- Production storage: Cloudflare D1 primary database
- Fallback/migration storage: Cloudflare KV namespace `ABSS_ADMIN`
- Build system: Custom Node.js build script

Main features:

- Public marketing website
- Services pages
- Projects/case-study style pages
- Contact/pricing/service inquiry lead capture
- Admin login
- Admin dashboard
- Lead management
- Project, client, support, and pricing admin pages
- Cloudflare D1 database migration support
- KV to D1 migration support

## 2. Important Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Local URL:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Validate project:

```bash
npm run validate
```

Apply D1 migrations locally:

```bash
npx wrangler d1 migrations apply ABSS-Website-DB --local
```

Apply D1 migrations in production:

```bash
npx wrangler d1 migrations apply ABSS-Website-DB
```

## 3. Project Structure

```text
.
├── src/
│   ├── pages/          Public website source pages
│   ├── admin/          Admin panel HTML pages
│   ├── styles/         Main CSS
│   ├── scripts/        Browser JavaScript
│   ├── services/       Frontend API/data service layer
│   └── config/         Frontend admin config
├── public/
│   └── assets/         Images and static assets
├── backend/
│   ├── server.js       Local Node.js backend and static server
│   └── data/db.json    Local JSON database
├── functions/
│   ├── api/[[path]].js Production Cloudflare Pages API routes
│   └── _lib/           D1 storage helpers
├── migrations/         Cloudflare D1 SQL migrations
├── database/           Database docs and older migration organization
├── scripts/            Build, validation, audit scripts
├── docs/               Architecture and production notes
├── dist/               Generated production build output
├── _headers            Cloudflare Pages security headers
├── _redirects          Cloudflare Pages redirects
├── robots.txt          SEO crawler rules
├── sitemap.xml         SEO sitemap
└── package.json        Project scripts and metadata
```

## 4. Frontend Pages

Main source pages live in `src/pages/`:

- `index.html` - Home page
- `about.html` - About page
- `services.html` - Services listing
- `service-website-development.html` - Website development service page
- `service-ui-ux-design.html` - UI/UX design service page
- `service-website-maintenance.html` - Website maintenance service page
- `projects.html` - Projects page
- `pricing.html` - Pricing page
- `contact.html` - Contact page
- `privacy-policy.html` - Privacy policy
- `terms-conditions.html` - Terms and conditions
- `refund-policy.html` - Refund policy
- `support-policy.html` - Support policy
- `disclaimer.html` - Disclaimer
- `sitemap.html` - Human-readable sitemap
- `404.html` - Not found page

Admin pages live in `src/admin/`:

- `admin-login.html`
- `admin-dashboard.html`
- `admin-leads.html`
- `admin-projects.html`
- `admin-clients.html`
- `admin-support.html`
- `admin-pricing.html`

Shared frontend files:

- `src/styles/styles.css` - Main styling
- `src/scripts/script.js` - Browser-side UI behavior
- `src/services/admin-api.js` - Admin API abstraction
- `src/config/admin-config.js` - Admin API mode/config

## 5. Local Backend

Local backend file:

```text
backend/server.js
```

It does three jobs:

- Serves static pages
- Handles local API routes
- Stores local data in `backend/data/db.json`

Default local port:

```text
3000
```

The port can be changed with:

```bash
PORT=4000 npm start
```

Local fallback admin credentials from `backend/server.js`:

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD=abss2026
AUTH_SECRET=abss-local-dev-secret
```

For safer local testing, set real environment variables instead of using defaults.

Local API routes:

- `POST /api/auth/login`
- `GET /api/admin/state`
- `PUT /api/admin/state`
- `POST /api/leads/contact`

## 6. Production Backend

Production API file:

```text
functions/api/[[path]].js
```

Production runs on Cloudflare Pages Functions.

Required Cloudflare environment variables:

```text
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-strong-password
AUTH_SECRET=generate-a-long-random-secret
```

Required Cloudflare bindings:

```text
ABSS_DB     Cloudflare D1 database binding
ABSS_ADMIN  Cloudflare KV binding used as backup/fallback
```

Production API routes:

- `POST /api/auth/login`
- `GET /api/admin/state`
- `PUT /api/admin/state`
- `GET /api/admin/storage-status`
- `POST /api/admin/migrate-storage`
- `GET /api/admin/leads`
- `PUT /api/admin/leads/:id`
- `DELETE /api/admin/leads/:id`
- `POST /api/leads/contact`

Authentication:

- Admin login returns a signed token.
- Token expiry is 8 hours.
- Admin API routes require `Authorization: Bearer <token>`.
- Token signing uses `AUTH_SECRET`.

## 7. Frontend API Mode

Admin frontend config:

```text
src/config/admin-config.js
```

Current config:

```js
window.AbssAdminConfig = {
  mode: "api",
  apiBaseUrl: "",
  backend: {
    provider: "cloudflare-pages-functions",
  },
};
```

Because `mode` is `api`, admin pages use backend routes instead of only browser localStorage.

The frontend service layer is:

```text
src/services/admin-api.js
```

It handles:

- Login/logout
- Session token storage
- Admin state loading/saving
- Contact lead creation
- Lead list/search/status pagination
- Lead update/delete
- Storage status
- KV to D1 migration trigger

## 8. Database

Primary production database: Cloudflare D1

D1 binding name:

```text
ABSS_DB
```

Recommended D1 database name:

```text
ABSS-Website-DB
```

Main migration files:

```text
migrations/0001_create_abss_database.sql
migrations/0002_remove_stale_demo_data.sql
```

Main D1 tables:

- `leads`
- `projects`
- `clients`
- `tickets`
- `pricing`
- `activity`
- `app_metadata`

Useful lead statuses:

- `New`
- `Follow Up`
- `Call Booked`
- `Proposal Sent`
- `Converted`
- `Rejected`

KV fallback:

- Binding name: `ABSS_ADMIN`
- State key: `admin-state.json`

KV is still important because:

- It works as migration source.
- It works as temporary fallback if D1 is disconnected.
- Existing KV data is not deleted during migration.

## 9. KV to D1 Migration

After deployment and after both bindings are connected:

1. Open admin dashboard.
2. Login with Cloudflare environment credentials.
3. Go to storage section.
4. Click `Migrate KV Data to D1`.

What migration does:

- Reads `admin-state.json` from `ABSS_ADMIN`
- Inserts legacy data into D1
- Uses idempotent insert/update behavior
- Writes migration metadata into `app_metadata`
- Keeps KV data untouched

Rollback behavior:

- Keep `ABSS_ADMIN` connected.
- If D1 has an issue, temporarily remove/disable `ABSS_DB`.
- API will use KV fallback.
- Reconnect `ABSS_DB` after fixing the issue.

## 10. Build Process

Build script:

```text
scripts/build.js
```

Build output:

```text
dist/
```

What build does:

- Removes old `dist/`
- Copies `src/` and `public/`
- Copies public pages to clean root-level HTML outputs
- Copies `robots.txt`, `sitemap.xml`, `_headers`, and `_redirects`
- Verifies required files exist

Build command for Cloudflare Pages:

```text
npm run build
```

Build output directory:

```text
dist
```

Functions directory:

```text
functions
```

Admin pages can be excluded from build with:

```bash
ABSS_EXCLUDE_ADMIN=true npm run build
```

## 11. Redirects and URL Compatibility

Root HTML files and older URLs are kept for compatibility.

Local backend maps clean URLs to source pages, for example:

- `/` -> `/src/pages/index.html`
- `/about` -> `/src/pages/about.html`
- `/services` -> `/src/pages/services.html`
- `/contact` -> `/src/pages/contact.html`
- `/admin-dashboard.html` -> `/src/admin/admin-dashboard.html`

Cloudflare redirects are managed in:

```text
_redirects
```

Security headers are managed in:

```text
_headers
```

## 12. Validation and Quality Checks

Validation command:

```bash
npm run validate
```

It runs:

- JavaScript syntax checks
- Link checks
- CSS brace sanity check
- Final audit script

Validation script:

```text
scripts/validate.sh
```

Other useful scripts:

- `scripts/check-links.sh`
- `scripts/check-css-braces.js`
- `scripts/final-audit.js`
- `scripts/build.js`

## 13. Security Notes

Already present:

- Backend API auth for admin
- Session token validation
- Cloudflare security headers
- Admin pages blocked from indexing
- Server-side contact form validation
- Honeypot field support in contact form validation
- Basic input normalization
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

Important production requirements:

- Set strong `ADMIN_USERNAME`
- Set strong `ADMIN_PASSWORD`
- Set long random `AUTH_SECRET`
- Bind `ABSS_DB`
- Keep `ABSS_ADMIN`
- Test contact form after deployment
- Add spam protection before high-traffic launch

## 14. Cloudflare Deployment Checklist

Cloudflare Pages settings:

```text
Build command: npm run build
Build output directory: dist
Functions directory: functions
Deploy command: leave blank
```

Create D1 database:

```text
ABSS-Website-DB
```

Bind D1:

```text
Variable/binding name: ABSS_DB
Database: ABSS-Website-DB
```

Create and bind KV:

```text
Binding name: ABSS_ADMIN
```

Add environment variables:

```text
ADMIN_USERNAME
ADMIN_PASSWORD
AUTH_SECRET
```

Run migrations:

```bash
npx wrangler d1 migrations apply ABSS-Website-DB
```

After deployment:

1. Open `/admin-login.html`.
2. Login using production credentials.
3. Submit public contact form.
4. Confirm new lead appears in admin.
5. Check `/api/admin/storage-status` from authenticated admin flow.
6. Run KV to D1 migration if old KV data exists.

## 15. Current Known Pending Items

From existing production checklist, pending items include:

- Test contact form on deployed Cloudflare Pages site
- Confirm final domain
- Update canonical URLs to final domain
- Test all redirects
- Test mobile layouts
- Add real testimonials
- Add real case study results
- Run `scripts/validate.sh`
- Add Cloudflare Pages environment variables
- Add `ABSS_ADMIN` KV binding
- Add spam protection
- Test schema with Google Rich Results tool
- Add edit modals for every admin module
- Add role-based access
- Test production deploy
- Test deployed form submission

## 16. Important Files Quick Reference

```text
README.md                              D1/KV migration notes
PROJECT_DETAILS.md                     This full project detail document
docs/ARCHITECTURE.md                   Architecture notes
docs/BACKEND-CONNECTION-GUIDE.md       Backend and Cloudflare connection guide
docs/PRODUCTION-CHECKLIST.md           Launch checklist
package.json                           Project scripts
backend/server.js                      Local backend
backend/data/db.json                   Local JSON database
functions/api/[[path]].js              Production API routes
functions/_lib/d1-storage.js           D1 data access layer
migrations/0001_create_abss_database.sql D1 schema
migrations/0002_remove_stale_demo_data.sql Demo cleanup migration
src/config/admin-config.js             Admin API config
src/services/admin-api.js              Frontend API client
src/styles/styles.css                  Main stylesheet
src/scripts/script.js                  Browser behavior
scripts/build.js                       Production build
scripts/validate.sh                    Validation entrypoint
_headers                               Cloudflare headers
_redirects                             Cloudflare redirects
```

## 17. Recommended Workflow

For development:

1. Run `npm install`.
2. Run `npm start`.
3. Open `http://localhost:3000`.
4. Make source changes in `src/`.
5. Test admin flow and contact form locally.
6. Run `npm run validate`.
7. Run `npm run build`.

For production:

1. Configure Cloudflare Pages.
2. Bind `ABSS_DB` and `ABSS_ADMIN`.
3. Add admin environment variables.
4. Apply D1 migrations.
5. Deploy.
6. Test public pages, admin login, contact form, and lead visibility.
7. Run KV to D1 migration if required.

