# Repository Guidelines

## Project Structure & Module Organization
- `index.html` and `game.rmmzproject` drive the RPG Maker MZ runtime; keep them in the project root.
- JavaScript engine files live in `js/`; custom gameplay logic belongs in `js/plugins`.
- Gameplay data is JSON under `data/`; edit through the MZ editor to avoid schema drift and merge conflicts.
- Art, audio, UI, and FX assets sit in `img/`, `audio/`, `css/`, `fonts/`, `effects/`, `movies/`, and `icon/`; keep exported filenames snake_case.

## Build, Test, and Development Commands
- Launch RPG Maker MZ and choose `File > Playtest` to spin up the engine with live data; run it before every pull request.
- `nwjs .` (from the project root) launches the desktop build for quick smoke tests; ensure your NW.js SDK is on the PATH.
- `http-server -c-1` serves the web build for browser debugging once installed (`npm install -g http-server`); disable caching while tuning assets.

## Coding Style & Naming Conventions
- Match RPG Maker defaults: 2-space indentation, semicolon-friendly ES5 syntax, and strict equality checks.
- Prefix plugin files `DoS_<Feature>.js`; register new plugins in `js/plugins.js`.
- Use PascalCase for classes, camelCase for functions and variables, and SCREAMING_SNAKE_CASE for constants embedded in data configs.
- Document non-obvious plugin APIs with concise JSDoc (for example, `/** @param {Game_Actor} actor */`).

## Testing Guidelines
- Manual: playtest story-critical paths via MZ, then repeat in NW.js to confirm packaged behavior.
- Automated: none yet; if you add coverage, place specs under `js/plugins/tests/` and gate them through a future lint or test task.
- Name temporary regression saves `test_<scenario>.rmmzsave` and store them outside version control.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`); write subjects in imperative mood under 72 characters.
- Separate asset drops from script changes to keep diffs reviewable.
- Pull requests must include a summary, map or event IDs touched, reproduction steps, and screenshots or GIFs for visual updates.
- Link Trello or Jira items (`Refs #ID`) and call out any save-file incompatibilities.

## Security & Configuration Tips
- Do not commit licensed RTP or marketplace assets without confirmed redistribution rights.
- Keep secrets (API keys, analytics IDs) in ignored config files, never in the repository.
- After engine updates, diff `rmmz_*` files before merging to avoid overwriting upstream patches.
