# Dungeon of Shadows

A narrative-heavy RPG Maker MZ project that blends tactical turn-based combat with free-form exploration, choice-driven events, and a trio of survival resources: hunger, sanity, and structural damage. Every decision nudges the party toward divergent endings that reflect how well they balanced survival with humanity.

## Overview
- Traverse cursed depths, uncovering lore shards and optional encounters that shape the finale.
- Engage in turn-based battles that react to resource status; low sanity unlocks risky skills while high hunger saps initiative.
- Navigate branching dialogues where moral choices, trades, and gambles feed directly into your resource meters and ending trajectory.

## Key Systems & Endings
- **Resource Management:** Hunger drains as you explore, sanity swings with dialogue and combat outcomes, and damage measures how much punishment the team and environment can take. Critical thresholds trigger bespoke event pages.
- **Branching Endings:** Track hidden trajectory metrics (Ascension, Beast, Lost, Paradox) that are recalculated after bosses, major decisions, and survival checks. Meeting specific thresholds unlocks unique finale maps, cinematics, and epilogues.
- **Event Tooling:** Common events update the global resource variables, while plugins in `js/plugins` expose helper commands (`DoS_ResourceAdjust`, `DoS_EndingTracker`) for designers.

## Project Layout
- `index.html`, `game.rmmzproject` – RPG Maker MZ bootstrap files.
- `data/` – JSON data for maps, actors, and events (edit through the MZ editor to avoid schema drift).
- `js/` – Engine core (`rmmz_*.js`) plus project logic in `js/plugins/`.
- `audio/`, `img/`, `movies/`, `effects/`, `fonts/`, `css/`, `icon/` – Packaged assets; keep filenames snake_case.

## Getting Started
1. Install **RPG Maker MZ** and clone or copy this repository into your projects directory.
2. Open `game.rmmzproject` inside MZ to inspect maps, events, and database entries.
3. (Optional) Install **NW.js SDK** and **Node.js** if you plan to smoke-test the build outside the editor.

## Running the Game
- **Playtest (Editor):** Launch RPG Maker MZ, open the project, then choose `File > Playtest` for rapid iteration.
- **Desktop Build:** From the project root run `nwjs .` (requires NW.js SDK on your PATH) to verify packaged behavior.
- **Browser Preview:** Once `http-server` is installed (`npm install -g http-server`), run `http-server -c-1` and open the served URL to debug in a modern browser. Disable caching while iterating on assets.

## Contribution Workflow
- Follow the coding, testing, and PR conventions in `AGENTS.md`.
- Separate asset imports from plugin scripting in pull requests to keep diffs reviewable.
- Note in PR descriptions which maps/events you touched and how your change influences hunger, sanity, or damage flow.

## Support & Roadmap
- Current focus: polishing combat states tied to sanity thresholds, fleshing out event chains that lead to the Paradox ending, and onboarding lightweight automated tests for plugin helpers.
- File bugs or feature requests via issues; include reproduction steps and the ending trajectory you observed.
