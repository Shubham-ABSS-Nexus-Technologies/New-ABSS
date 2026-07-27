# src/admin

Future home for admin page source.

Security status: production-ready only when `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
`AUTH_SECRET`, and the Cloudflare KV binding `ABSS_ADMIN` are configured in the
deployment environment. The Cloudflare Pages build includes these pages when
`CF_PAGES=1` is available.

Current admin pages:

- `admin-login.html`
- `admin-dashboard.html`
- `admin-leads.html`
- `admin-projects.html`
- `admin-clients.html`
- `admin-support.html`
- `admin-pricing.html`
