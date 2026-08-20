# Independent Architecture Review Prompt

You are reviewing the complete runnable source for a Three.js browser-based sandbox builder called **Mossbound Salvage Yard**.

The product goal is deliberately **not conservative maintenance**. It is a polished vertical slice that proves an AI agent can architect and ship a reliable creative 3D tool that users want to try. We are willing to delete or replace legacy code if that produces a stronger working concept.

## Repository context

- `dev/example-gallery/examples/threejs-procedural-materials/hybrid-soil-moss-surface/scene-v20.js` is the current scene/editor.
- `scene.js` and `scene-v9.js` through `scene-v20.js` show the implementation history and regressions.
- `sandbox/` is the newer structural foundation.
- `sandbox-board-state.js` is the compatibility facade currently used by the scene.
- `dev/example-gallery/runtime/` is the browser runtime.
- `skills/threejs-procedural-materials/` contains imported shader/material/model code and required assets.
- Root `index.html` is the current entry point.

## Intended architecture

```text
World State
  -> Commands / Transactions
  -> Validation
  -> Derived occupancy / terrain / path data
  -> Render registry
  -> Three.js visual projection
```

The world state should be authoritative. Meshes should be disposable projections. Logical rotations should be quarter-turn integers (`0..3`); Three.js presentation uses radians. Failed operations must leave state unchanged. The complete product needs placement, movement, rotation, deletion, terrain editing, paths/streams, presets, undo/redo, and polished visual presentation.

## Important current limitation

The migration is incomplete. `scene-v20.js` still contains legacy event handlers and a separate `editor.history` array, so the code may have competing state and history paths. Do not assume the presence of `sandbox/` means the browser editor actually uses it correctly.

## Review requirements

Give an independent, critical, adversarial review. Do not simply approve the direction. Inspect the actual files and trace the browser interaction paths.

Answer all of these:

1. Is the architecture sufficient for a reliable vertical slice, or are foundational systems missing?
2. Which parts should be rebuilt cleanly instead of migrated from `scene-v20.js`?
3. What hidden coupling and regression points are highest risk?
4. Are transactions, undo/redo, serialization, IDs, rotation units, and rollback actually correct? Cite concrete code-level issues.
5. Does the compatibility facade help or harm? Should it be deleted?
6. What is the minimum complete product architecture before visual polish?
7. What should be implemented first, second, and third?
8. Which automated tests and browser interaction tests would catch likely regressions?
9. What should be explicitly deleted or abandoned?
10. What would make the demo compelling to a new user within 30 seconds?
11. Give a concrete recommended folder/module structure.
12. Give a concrete migration or rebuild plan in phases, with completion gates.
13. Identify any claims in the architecture that sound impressive but would fail in actual browser interaction.

## Output format

- Executive verdict
- Critical blockers (ranked P0/P1/P2)
- What to delete
- Recommended architecture
- Test matrix
- Phased implementation plan
- 30-second demo plan
- Specific code references for every important criticism
