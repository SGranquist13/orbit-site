# Orbit marketing site

Public product preview for Orbit desktop and Orbit Mobile. The app repositories remain private during development.

## Develop

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

## Publish

Live site: https://sgranquist13.github.io/orbit-site/

Every push to `main` builds and deploys through `.github/workflows/deploy.yml`. GitHub Pages must use **GitHub Actions** as its source.

To reproduce the production build in PowerShell:

```powershell
$env:SITE_URL = 'https://sgranquist13.github.io'
$env:BASE_PATH = '/orbit-site'
npm run build
npm run preview
```

For a custom domain, configure it in Settings → Pages and set the Actions variables `SITE_URL` to the HTTPS origin and `BASE_PATH` to `/`.

Launch links live in `src/config.ts`. Until the apps are public, use this repository to follow development and share feedback. Watching the repository for discussions gives GitHub notifications; this is not an email waitlist.

## Media

Production videos and share artwork are in `public/`; source images used by Astro are in `src/assets/`. Social post assets are in `social/`.

Capture helpers in `scripts/` expect separately running local Orbit desktop (:1420) and mobile web (:8099) apps. `scripts/demo-orbit.mjs` provides simulated demo data. Raw captures and local QA output under `media/` are intentionally excluded from Git.
