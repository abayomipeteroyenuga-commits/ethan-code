# ETHAN CODE v7.3 — Production Robustness Upgrade

Domain: https://learncoding.ethandigitalacademy.org

This release upgrades the v7.2 child-first classroom while preserving the official Ethan Code branding and all existing lessons.

## v7.3 upgrades
- Explicit DOM bindings instead of relying on browser-created ID globals.
- Continue Learning opens the learner's first unfinished lesson.
- Course cards show completed-course state and resume at the first unfinished lesson.
- Quick-question results persist locally on the learner's device.
- Mission stars are awarded once per mission instead of repeatedly on replay.
- Mission completion state is persisted and shown on mission cards.
- Puzzle shuffle avoids beginning in the already-solved order.
- Creative Playground now loads safe starter templates into Practice Corner for Story, Mini Game, Code Art and Website projects.
- Progress panel includes Continue Learning and a confirmed Reset Progress action.
- Mobile navigation closes on link selection, outside click and Escape.
- Progress modal closes with Escape.
- Existing sandboxed HTML/CSS/JavaScript preview retained.
- Python remains instructional/conceptual; no fake browser Python runtime is claimed.

## Deployment
Upload the contents of this ZIP to the Ethan Code GitHub repository and deploy to Vercel. Keep the production domain mapped to learncoding.ethandigitalacademy.org.

## Backend status
Learning progress remains local-first. The included Supabase schema is preparation for later Ethan ID/backend integration; this build does not falsely claim that central authentication or cloud progress sync is active.
