# Ethan Code — Railway deployment

Ethan Code is a static, browser-based learning application. The Dockerfile packages the existing files into Nginx for Railway.

## Railway service setup

1. Create a Railway project and add a service from `abayomipeteroyenuga-commits/ethan-code`.
2. Select the `railway-deployment-upgrade` branch for the first preview.
3. Railway detects the root `Dockerfile`; no build or start command is required.
4. Nginx listens on Railway's injected `PORT` and binds to `0.0.0.0`.
5. Set the service healthcheck path to `/healthz`.
6. Generate a Railway public domain and test it before adding the production domain.

## Production domain cutover

Do not remove the Vercel domain or change DNS until Railway is healthy and the preview passes testing.

1. Test the Railway public URL over HTTPS.
2. Verify the home page, course catalog, lessons, local progress, Blockly editor, Code Studio, Challenge Lab, PWA install flow and offline cache.
3. Add `learncoding.ethandigitalacademy.org` as a custom domain in Railway.
4. Apply the exact DNS record Railway displays at the DNS provider.
5. Wait for domain verification and TLS certificate provisioning.
6. Test the custom domain, refresh, PWA and service worker.
7. Retire Vercel only after successful verification.

## Existing learner data

The current app stores learner progress and Blockly workspace data in each browser's local storage. It does not provide account-based or cross-device synchronization. Hosting migration does not move or erase browser local storage. No database migration is required for this static deployment.

## Runtime

- Health endpoint: `/healthz`
- Web server: Nginx on `0.0.0.0:$PORT`
- Build: Dockerfile; no npm build step
- Static root: `/usr/share/nginx/html`
- Service worker and manifest remain at the site root.
- Blockly loads the pinned Blockly 13.4.0 bundle from unpkg; first load requires internet access.
