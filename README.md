# ETHAN CODE v8.2 — Expanded Visual Coding & Programming Academy

A static, responsive learning platform for `learncoding.ethandigitalacademy.org`.

## What's new in v8.2

- Expanded the classroom from 10 to **20 learning tracks** and from 30 to **60 guided lessons**.
- Added structured learning in Scratch/ScratchJr, Scratch game development, Blockly, Code.org, MakeCode Arcade, micro:bit, MIT App Inventor, Python projects, robotics, TypeScript, Java, C, C++, SQL, Git/GitHub, APIs, AI and data literacy.
- Added a built-in **Visual Block Lab** powered by Blockly. Learners can drag blocks, load starter programs, generate JavaScript, run the result in a sandboxed preview, download the generated JavaScript and save their workspace locally.
- Added official learning links for Scratch, ScratchJr, Blockly, Code.org, MakeCode, micro:bit, MIT App Inventor, Arduino, Python and MDN web technologies.
- Added an installable **Progressive Web App (PWA)** manifest, service worker, app icons and an Install App button where the browser supports it.
- Preserved the existing classroom, lessons, learner progress, missions, puzzles, projects, HTML/CSS/JavaScript Code Studio, 12-task Challenge Lab and Supabase schema.

## Important learning and runtime notes

- Scratch is a separate visual storytelling and game-making platform. The platform provides Scratch lessons and links to the official Scratch editor; it does not attempt to reproduce the full Scratch editor.
- The built-in Block Lab uses Blockly and generates JavaScript for its sandboxed preview. Blockly is the visual block editor in this app; it is not the Scratch editor.
- The existing Code Studio runs HTML, CSS and browser JavaScript. Python, Java, C, C++, TypeScript, SQL and other advanced topics are taught through structured lessons and examples but are not executed by the browser Code Studio.
- Blockly's pinned browser bundles are loaded from the official Blockly package on unpkg. The Block Lab therefore needs an internet connection on first load. The service worker attempts to cache those files for later offline use when the CDN allows it; the core Ethan Code classroom remains available offline after the PWA cache is installed.
- Blockly programs execute inside a sandboxed iframe with a restrictive Content Security Policy. The preview is for beginner learning, not a production code execution service.
- Learner progress and the Blockly workspace are saved in the current browser using local storage. There is no account sync or cross-device progress sync in this static build.

## Deployment

1. Extract the ZIP.
2. Upload the **contents** of this folder to the existing Ethan Code Vercel project, keeping `index.html` at the repository root.
3. No build command is required; this is a static site.
4. Deploy over the existing `learncoding.ethandigitalacademy.org` project after reviewing the preview.
5. Open the site over HTTPS, refresh once, then use the browser's install option or the **Install App** button when it appears.

## Included files

- `index.html` — main app and all learning sections.
- `assets/extra-courses.js` — the 10 new course tracks.
- `assets/blockly-lab.js` — Blockly workspace, starter programs, code generation and sandbox preview.
- `assets/pwa.js`, `manifest.webmanifest`, `sw.js`, `icons/` — PWA support.
- `assets/app.js`, `assets/studio.js`, `assets/challenges.js`, `assets/style.css` — existing Ethan Code application and styling.
- `supabase/schema.sql` — retained schema reference; this static v8.2 expansion does not require a database migration.

## Attribution

Blockly is an open-source visual programming library distributed under the Apache License 2.0. Blockly browser bundles are loaded from the pinned `blockly@13.4.0` package on unpkg.
