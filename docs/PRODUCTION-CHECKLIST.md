# Production Checklist

## Before Launch

- [x] Replace frontend-only demo login with backend API auth.
- [x] Add production backend function.
- [x] Add Cloudflare KV database storage.
- [ ] Test contact form on deployed Cloudflare Pages site.
- [ ] Confirm final domain.
- [ ] Update canonical URLs to final domain.
- [ ] Test all redirects.
- [ ] Test mobile layouts.
- [ ] Add real testimonials.
- [ ] Add real case study results.
- [ ] Run `scripts/validate.sh`.

## Security

- [x] Security headers added.
- [x] Admin pages blocked from indexing.
- [x] Move primary login verification to backend API.
- [x] Remove visible/prefilled admin credentials from login page.
- [x] Add basic server-side validation.
- [ ] Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `AUTH_SECRET` in Cloudflare Pages environment variables.
- [ ] Add `ABSS_ADMIN` Cloudflare KV binding.
- [ ] Add spam protection.

## SEO

- [x] `robots.txt` added.
- [x] `sitemap.xml` added.
- [x] Open Graph image exists.
- [ ] Final canonical URLs added.
- [ ] Schema tested with Google Rich Results tool.

## Admin

- [x] Admin login page separated.
- [x] Admin pages separated.
- [x] Admin data service exists.
- [x] Local backend auth connected.
- [x] Local JSON database connected.
- [x] Cloud database storage added with Cloudflare KV.
- [ ] Edit modals added for every module.
- [ ] Role-based access added.

## Deployment

- [x] `_headers` added.
- [x] `_redirects` added.
- [x] Cloudflare Pages Functions API route added.
- [ ] Cloudflare Pages production deploy tested.
- [ ] Form submission tested on deployed URL.
