# Uniweb Deployment

The production React app can be deployed to Uniweb from GitHub Actions. The workflow builds the Vite app and uploads only `dist/` to the live web root.

## GitHub Secrets

Add these in GitHub repository settings:

- `SSH_HOST`: Uniweb SSH hostname
- `SSH_USERNAME`: Uniweb SSH username
- `SSH_PRIVATE_KEY`: private key for deploy access
- `SSH_TARGET_DIR`: live web root path, for example `public_html`
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon key

`SSH_TARGET_DIR` must be the web root, not `/` or `.`.

## Domain Move

When `lofotenpeaks.no` points to Uniweb, update Supabase Auth:

- Site URL: `https://lofotenpeaks.no`
- Redirect URLs:
  - `https://lofotenpeaks.no/*`
  - `https://www.lofotenpeaks.no/*`

Keep the Netlify URL in Supabase redirect URLs until the transition is finished.

## Routing

`public/.htaccess` is included so Apache serves React routes through `index.html`. This is required for direct refreshes on routes like `/mountains/reinebringen`, `/account`, and `/admin`.

## First Deploy Checklist

1. Add all GitHub secrets.
2. Enable HTTPS for `lofotenpeaks.no` and `www.lofotenpeaks.no` in Uniweb.
3. Push to `main` or run the `Deploy to Uniweb` workflow manually.
4. Test the homepage, mountain detail routes, login, admin, and Supabase data.
