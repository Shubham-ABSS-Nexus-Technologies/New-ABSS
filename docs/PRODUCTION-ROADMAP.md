# Production Completion Roadmap

This roadmap is for turning ABSS Nexus Technologies into a corporate IT services and software development agency website.

## Status Summary

Completed locally:

- Folder structure separated.
- Public pages moved into `src/pages`.
- Admin pages moved into `src/admin`.
- Assets moved into `public/assets`.
- Styles, scripts, config, and services separated.
- Admin pages split by module.
- Admin login page separated.
- Local admin data service created.
- Database schema scaffold created.
- Dependency-free Node backend added.
- Backend API authentication added.
- Visible/prefilled admin credentials removed from login page.
- Local JSON database persistence added.
- Contact form API endpoint added.
- Validation scripts created.
- Security headers, redirects, and robots rules added.

Still needs external production setup:

- Cloudflare Pages production deployment environment.
- Cloudflare Pages environment variables: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`.
- Cloudflare KV binding named `ABSS_ADMIN`.
- Final domain URL.

## Phase 1 - Public Website Polish

Goal:

- Make the public site feel like a corporate IT services agency.

Tasks:

- Improve homepage messaging.
- Add service detail pages.
- Add case study pages.
- Add stronger calls to action.
- Add industries served.
- Add process and delivery model.
- Add testimonials once real reviews are available.
- Add real client/project results once available.

Local implementation status:

- Service detail scaffolds added.
- Case study scaffold added.
- 404 page added.

## Phase 2 - SEO And Discovery

Goal:

- Make the site crawlable, understandable, and shareable.

Tasks:

- Add XML sitemap.
- Add robots rules.
- Add Open Graph metadata.
- Add schema JSON-LD.
- Add unique page titles/descriptions.
- Add image alt text review.
- Add canonical URLs after final domain confirmation.

Local implementation status:

- `sitemap.xml` added.
- `robots.txt` exists.
- SEO schema helper added.

## Phase 3 - Real Admin Authentication

Goal:

- Replace demo login with real auth.

Local implementation status:

- Backend API login is available at `POST /api/auth/login`.
- Admin verification no longer depends only on frontend password comparison.
- Local session token is stored in session storage.

Production implementation:

- Cloudflare Pages Function login endpoint.
- Admin credentials stored as Cloudflare Pages environment variables.
- Signed admin token stored in session storage.
- Admin pages validate the token against the API.

## Phase 4 - Real Database

Goal:

- Replace localStorage admin data with real database.

Tables:

- `leads`
- `projects`
- `clients`
- `support_tickets`
- `pricing_packages`
- `activity_log`

Local implementation status:

- Migration exists at `database/migrations/001_initial_admin_schema.sql`.
- Local JSON database exists at `backend/data/db.json`.
- Admin state API is available at `GET/PUT /api/admin/state`.

Production implementation:

- Cloudflare KV store added for admin state.
- Public leads and admin data can be saved by the serverless API.

## Phase 5 - Contact Form To Lead Database

Goal:

- Website inquiries should appear in admin Leads.

Tasks:

- Validate form fields.
- Store lead in database.
- Add spam protection.
- Add email notification.
- Show user-friendly success/error message.

Current status:

- Contact form submits to local backend API when backend is running.
- Contact form falls back to local queue if API is unavailable.
- Cloudflare production form submit uses `/api/leads/contact`.

Production status:

- Cloudflare Pages Function lead insert endpoint added.
- Final deployed form behavior still needs testing on the live URL.

## Phase 6 - Deployment QA

Goal:

- Verify real deployed behavior.

Tasks:

- Deploy to Cloudflare Pages.
- Check redirects.
- Check `_headers`.
- Check `robots.txt`.
- Check `sitemap.xml`.
- Test contact form.
- Test admin login.
- Test mobile layout.
- Test social previews.
- Run validation scripts before deploy.

## Phase 7 - Long-Term Agency Website Growth

Future improvements:

- Blog/resources section.
- Downloadable company profile PDF.
- Project estimate calculator.
- Client portal.
- Proposal generator.
- Invoice/payment tracking.
- Analytics dashboard.
