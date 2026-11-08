# Ethan Code — Railway deployment

Ethan Code is a static, browser-based learning application. It has no Node build step or server-side runtime. The Dockerfile packages the existing static files into Nginx so Railway can serve the app reliably.

## Railway service setup

1. Create a new Railway project and add a service from the GitHub repository `abayomipeteroyenuga-commits/ethan-code`.
2. Select the `railway-deployment-upgrade` branch for the initial preview deployment. After validating it, switch the service to `main` or merge the reviewed changes.
3. Railway detects the root `Dockerfile` automatically. No build command or start command is required.
4. The Nginx template listens on Railway's injected `PORT` variable and binds to `0.0.0.0`.
5. In the service settings, set the healthcheck path to `/healthz`.
6. Generate a Railway public domain and test it before attaching the production custom domain.

## Production domain cutover

Do not remove the Vercel domain or change DNS until the Railway deployment is healthy and the preview has passed testing.

1. Test the Railway public URL over HTTPS.
2. Verify the home page, course catalog, lessons, local progress, Blockly editor, Code Studio, challenge lab, PWA install flow and offline cache.
3. Add `learncoding.ethandigitalacademy.org` as a custom domain in Railway.
4. Apply the exact DNS record Railway displays at the DNS provider.
5. Wait for Railway domain verification and TLS certificate provisioning.
6. Test the custom domain, refresh, PWA and service worker.
7. Only after successful verification should the Vercel deployment be retired.

## Existing application data

The current v8.2 app stores learner progress and Blockly workspace data in each browser's local storage. It does not provide account-based or cross-device synchronization. Hosting migration does not move or erase browser local storage. No database migration is required for this static deployment.

## Runtime notes

- Health endpoint: `/healthz`
- Web server: Nginx on `0.0.0.0:$PORT`
- Build: Dockerfile; no npm install or build step
- Static root: `/usr/share/nginx/html`
- Keep the service worker and manifest at the site root.
- The Blockly library is loaded from the pinned Blockly 13.4.0 CDN bundle; first load of the visual editor requires internet access.
