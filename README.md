# Goobs Studio — Development Build 0.5

Five independent playable web-game slices in one iPad-first launcher. Separate from Goobs Games. These are initial prototypes, not finished premium games or verified M2 performance builds.

## Playable content

- **The Last Resort**: four illustrated locations across two chapters. Reception and its new reading lounge link a compass-lock and aerial puzzle; the boathouse and new engine workshop link tide codes, mooring, pump repair, refueling and departure signals.
- **Fairway Coast**: three coastal holes with club selection, three-tap or flick swings, close putting camera, scorecard and saved round. Club loft, wind, lie-dependent bounce/roll, rough and bunker penalties, and speed-aware cup capture. v0.5 reduces ball diameter to about one quarter of v0.4 and increases landing energy loss and rolling resistance. Full green putts reach roughly 10 m and stop in under 5 seconds in the unit simulation.
- **Diamond Nights**: 3-, 6- or 9-inning matches with visitors batting first, extra innings, walk-offs, inning scorecards and selectable pitch types; animated player artwork, textured infield, light halos, windup, broadcast camera, balls/walks, live fielder pursuit, catches and scoring. v0.4 corrects the catcher orientation, adds distinct pitch paths, uses the same drag/gravity model for predicted and visible batted flight, checks actual glove reach, and distinguishes fence rebounds from home runs.
- **Afterlight**: two 3D side-view station sectors; smoothed movement, buffered jumping and coyote time, power-cell/relay puzzle, timed security beam, second checkpoint, flight recorder and escape. v0.4 replaces the placeholder astronaut and planet with animated character artwork, a cinematic orbital backdrop, detailed station panels and equipment. v0.5 adds orbital docks, a life-support pressure puzzle, two alternating security gates, a navigation core and an escape pod.
- **Coastal Run**: a rebuilt 2.4 km elevated coastal route, licensed detailed 3D coupe with reflective paint, photographic asphalt, smooth steering, drag steering, optional auto-throttle, roadworks and new route records. v0.5 raises the cap to 200 mph (322 km/h), adds a saved mph/km/h toggle for speed and distance, retunes braking/steering, and widens the camera with speed.

All games support portrait and landscape layouts. Golf and driving change their cameras with the aspect ratio. Version 0.3 adds photographic terrain materials, a coastal panorama and HDR reflections, organic bunker borders, a lighthouse, shoreline rocks, and a detailed car. Baseball uses six-pose transparent sprite animation within a 3D stadium. Larger courses, seasons, chapters and fully rigged character animation remain future work.

## Repository layout

`dist/` is the complete website. It has no build step and no runtime CDN dependency.

- `dist/index.html`: shared launcher and entrypoint.
- `dist/games/`: separate game modules.
- `dist/shared/`: shell, storage, sounds, game rules, renderer helpers and vendored Three.js.
- `dist/assets/`: local images and icons.
- `dist/sw.js`: all-game offline cache.
- `tests/`: rule tests and Node-only scene smoke tests.

## GitHub Pages

Upload this repository to your own new GitHub repo. The included `.github/workflows/pages.yml` publishes `dist/` via GitHub Actions. In **Settings → Pages**, select **GitHub Actions** as the source. The site uses relative paths and works under a repository subpath.

To upload only the hosted site manually, use the contents of `dist/` at the repository root. Keep all subfolders intact.

## Local use

Serve `dist/` using an HTTP server; opening `index.html` as a file will not load ES modules correctly. For example: `python3 -m http.server 8080 --directory dist`.

On iPad, open the HTTPS page in Safari and use Share → Add to Home Screen. Wait for **Ready offline · all 5 games** before disconnecting. Saves and settings live in browser storage on that device. Browser or OS storage eviction can remove them.

## Verification

Completed: JavaScript syntax checks; 29 tests covering golf timing, baseball contact/walks/fielding/runner scoring, driving smoothness/bounds/frame-rate consistency, road continuity and resort prerequisites; The local Draco decoder parses the full car model, checks body/glass/wheel nodes, bounds and orientation; the HDR is decoded and checked. Node scene smoke test mounted, stepped and disposed all five modules with a mocked renderer, including portrait dimensions. Complete Node driving and multi-inning simulations, reception-to-boathouse and sector transitions, connected-room puzzle controls, dock launch prerequisites, and unit-preference persistence are also exercised. Offline manifest coverage and file paths are checked.

**Not verified:** real browser rendering, touch behavior, cold offline reopening, physical iPad frame rate, GPU memory, thermal behavior, or full browser game playthroughs. The Node scene test does not validate rendering. Browser QA was unavailable in the authoring environment.

`npm test` runs portable rule tests. `npm run test:smoke` requires the optional `@napi-rs/canvas` development package. No packages are needed to host or play the games.

## Art provenance

`dist/assets/resort.webp` was generated with the built-in image-generation tool for this project. Brief: realistic deserted tropical resort reception at blue hour; walnut desk and ledger, brass key cabinet, teal sea doors, radio and nautical chart, warm lamps, ocean windows, no baked-in puzzle text. The game adds clues and live controls separately. `boathouse.webp` is a matching generated island boathouse with launch, tide gauge, locker, winch and rope; `coastal-pine.webp` is a generated transparent Mediterranean pine used by golf and driving.

See `dist/credits.html` and `THIRD_PARTY_LICENSES.txt` for asset sources, licenses, and changes. The new player sheets, turf and panorama were generated for the project. The coupe is a CC BY 4.0 model by vicent091036; surfaces and lighting are CC0 Poly Haven assets. Three.js r169 is MIT; Draco is Apache 2.0. All are bundled locally for offline use.

## v0.5 scope and save compatibility

Existing save keys remain compatible. Completed reception/sector saves lead into the next chapter/sector. Previously completed Resort puzzles remain solved; restart the chapter to experience its full expanded puzzle chain. Speed-unit preference persists separately from run progress. Driving records use a new v0.5 key because faster physics make previous times incomparable; old records remain stored. Baseball resumes old one-inning saves within the new three-inning match format.

Traffic, police modes, home run derby and batting/pitching practice are not included yet. See `ROADMAP.md`. On-device tuning and performance profiling remain necessary; automated simulation does not establish iPad frame rate or touch feel.
