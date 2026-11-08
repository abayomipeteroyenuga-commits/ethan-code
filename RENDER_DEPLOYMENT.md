# Deploy Ethan Code on Render

Ethan Code is a static Progressive Web App. Use Render's **Static Site** service; a Docker web service is unnecessary for this project.

## Blueprint deployment

1. Sign in to Render and choose **New → Blueprint**.
2. Connect the GitHub repository `abayomipeteroyenuga-commits/ethan-code`.
3. Select branch `railway-deployment-upgrade`.
4. Render detects the root `render.yaml` blueprint and creates the `ethan-code` static site.
5. Wait for the deploy to finish, then open the generated `onrender.com` URL.
6. Test the home page, course navigation, Blockly lab, Code Studio, PWA manifest, service worker and offline behavior.

## Custom domain

After the Render URL passes testing:

1. Open the Render static site's **Settings → Custom Domains**.
2. Add `learncoding.ethandigitalacademy.org`.
3. Follow the exact DNS records Render displays. Do not guess the target or proxy settings.
4. Wait for Render to verify the domain and provision TLS.
5. Test the custom domain over HTTPS, including a hard refresh and PWA install.

Keep the existing Vercel deployment and DNS unchanged until Render has passed all checks. Switch DNS only after the Render service is healthy and the custom domain is verified.

## Runtime notes

- Build command: none (static files are published from the repository root).
- Publish directory: `.`
- Ethan Code Classroom uses a dedicated Neon PostgreSQL project with Neon Auth and the Neon Data API. Its public Auth and Data API URLs are configured in `assets/ethan-classroom-cloud.js`; no database password or admin secret is exposed in the browser.
- The classroom database has row-level security policies for teacher/student access. Submission scores are recalculated by a database trigger from the teacher's published phrase checks.
- The classroom requires the production Neon schema, Data API and trusted origins to be provisioned before use. The current app code targets `https://ethan-code.onrender.com` and `https://learncoding.ethandigitalacademy.org`.
- General learner progress and Blockly workspace remain browser-local. Only classroom accounts, memberships, assignments and submissions are cloud-synced.
- Blockly is loaded from the pinned `blockly@13.4.0` CDN package, so first-load access to that CDN is required.
- The repository's Dockerfile and Nginx configuration are retained for portability but are not used by Render's static-site blueprint.
