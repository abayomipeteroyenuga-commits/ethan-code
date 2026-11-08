# ETHAN CODE v8.3 — Expanded Visual Coding & Programming Academy

A static, responsive learning platform for `learncoding.ethandigitalacademy.org`, prepared for portable Docker deployment on Railway while retaining its existing Vercel configuration during migration.

## Learning platform

- 20 learning tracks and 60 guided lessons.
- Scratch/ScratchJr, Scratch game development, Blockly, Code.org, MakeCode Arcade, micro:bit, MIT App Inventor, Python projects, robotics, TypeScript, Java, C, C++, SQL, Git/GitHub, APIs, AI and data literacy.
- Built-in Visual Block Lab powered by Blockly, including starter programs, JavaScript generation, sandbox preview, code download and local workspace saving.
- HTML/CSS/JavaScript Code Studio, 12-task Challenge Lab, classroom, missions, puzzles and projects.
- Installable Progressive Web App with manifest, service worker and app icons.

## Learning and runtime notes

- Scratch is a separate visual storytelling and game-making platform. Ethan Code links to the official Scratch editor; it does not reproduce the full Scratch editor.
- The built-in Block Lab uses Blockly and generates JavaScript for its sandboxed preview. Blockly is not the Scratch editor.
- Code Studio runs HTML, CSS and browser JavaScript. Python, Java, C, C++, TypeScript, SQL and other advanced topics are taught through structured lessons and examples but are not executed by Code Studio.
- Blockly browser bundles are loaded from the pinned `blockly@13.4.0` package on unpkg. The Block Lab needs internet access on first load; the service worker attempts to cache these files for later offline use.
- Learner progress and Blockly workspace are saved in the current browser using local storage. There is no account sync or cross-device progress sync in this static build.

## Deployment

### Railway

The repository includes a root `Dockerfile`, Nginx configuration template and Railway deployment guide. Railway can build the Docker image directly from GitHub. Nginx listens on Railway's injected `PORT` and exposes `/healthz` for deployment health checks.

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for service setup and a safe custom-domain cutover checklist.

### Vercel

The existing Vercel configuration is retained during migration. Do not remove the Vercel project or domain until Railway has passed preview, health, PWA and custom-domain checks.

## Included files

- `index.html` — main app and learning sections.
- `assets/extra-courses.js` — expanded course tracks.
- `assets/blockly-lab.js` — Blockly workspace, starter programs, code generation and sandbox preview.
- `assets/app.js`, `assets/studio.js`, `assets/challenges.js`, `assets/style.css` — learning application and styling.
- `assets/pwa.js`, `manifest.webmanifest`, `sw.js`, `icons/` — PWA support.
- `supabase/schema.sql` — retained schema reference; this static build does not require a database migration.
- `Dockerfile`, `nginx/default.conf.template` — Railway container deployment.
- `RAILWAY_DEPLOYMENT.md` — deployment and custom-domain migration guide.

## Attribution

Blockly is an open-source visual programming library distributed under the Apache License 2.0.
