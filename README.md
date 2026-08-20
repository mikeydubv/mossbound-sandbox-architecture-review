# Mossbound Sandbox Architecture Review

This is a sanitized review snapshot of the Mossbound Salvage Yard browser sandbox builder.

## Product goal

A bold vertical slice proving that an AI agent can build a reliable, attractive creative 3D tool: users should be able to start blank, place and manipulate assets, edit terrain, build connected paths/streams, switch environments, and undo/redo without regressions.

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

## Included files

- `scene-v20.js` — current monolithic scene/editor integration
- `sandbox-board-state.js` — compatibility facade
- `sandbox/` — grid, footprint, world state, paths, presets, validation, registry, command boundary, and smoke tests

## Local checks

```bash
node sandbox/foundation-smoke.mjs
node sandbox/smoke-test.mjs
node sandbox/command-smoke.mjs
node --check scene-v20.js
```

## Review focus

The scene still contains legacy editor handlers and a separate local history stack. Review whether the correct move is to migrate those handlers or replace the editor shell with a clean vertical-slice implementation.
