# Mossbound Sandbox — Full Architecture Review Snapshot

This is a sanitized, runnable snapshot of the Mossbound Salvage Yard browser sandbox builder and its relevant development history.

## Product goal

A bold vertical slice proving that an AI agent can build a reliable, attractive creative 3D tool. A new user should be able to start from a blank world, place and manipulate assets, edit terrain, create connected paths/streams, switch environments, and undo/redo without regressions.

## Run locally

The app expects the repository root to be served as a static web root because the scene uses `/dev/...` and `/skills/...` absolute module paths.

```bash
python3 -m http.server 8080
# open http://localhost:8080/
```

The root entry point loads the current v20 scene through the example runtime.

## Test

```bash
npm test
npm run check
```

## Included

- `dev/example-gallery/examples/threejs-procedural-materials/hybrid-soil-moss-surface/` — all scene generations, current v20 scene, board facade, sandbox foundation, tests, and metadata
- `dev/example-gallery/runtime/` — local example runtime used by the builder
- `skills/threejs-procedural-materials/` — imported material/model modules and required textures
- root entry point and the deployed-style route entry point

## Intended architecture

```text
World State
  -> Commands / Transactions
  -> Validation
  -> Derived occupancy / terrain / path data
  -> Render registry
  -> Three.js visual projection
```

World state is authoritative. Three.js objects are disposable projections. Logical rotations are quarter-turn integers (`0..3`); render rotations are radians.

## Known review target

The current scene still contains legacy editor handlers and a separate local history stack. The purpose of this repository is to decide whether to migrate those handlers or replace the editor shell with a clean vertical-slice implementation.

No credentials, environment files, node_modules, or unrelated workspace projects are included.
