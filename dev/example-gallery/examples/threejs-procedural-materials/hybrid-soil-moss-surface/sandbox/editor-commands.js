import { createRenderRegistry } from './render-registry.js';

/**
 * Application boundary for the builder. UI code dispatches commands here;
 * Three.js objects are projections and never become the source of truth.
 */
export function createEditorCommands(world, options = {}) {
  const registry = options.registry || createRenderRegistry();
  const hooks = options.hooks || {};
  const emit = (event, payload = {}) => hooks[event]?.(payload, world);
  const refresh = () => {
    const ids = world.getPlacements().map((placement) => placement.id);
    registry.reconcile(ids, {
      create: (id) => hooks.createPlacement?.(world.getPlacement(id), world) || null,
      update: (object, id) => hooks.updatePlacement?.(object, world.getPlacement(id), world),
      remove: (object, id) => hooks.removePlacement?.(object, id, world),
    });
    emit('refresh', { ids });
  };
  const run = (type, execute, meta = {}) => {
    const result = execute();
    if (result?.valid) {
      refresh();
      emit('command', { type, result, meta });
    } else emit('rejected', { type, result, meta });
    return result;
  };
  return {
    world,
    registry,
    add(spec) { return run('placement.add', () => world.addPlacement(spec), { id: spec.id }); },
    move(id, anchor) { return run('placement.move', () => world.movePlacement(id, anchor), { id }); },
    rotate(id, quarterTurns) { return run('placement.rotate', () => world.rotatePlacement(id, quarterTurns), { id }); },
    remove(id) { return run('placement.remove', () => world.removePlacement(id), { id }); },
    terrain(cell, patch) { return run('terrain.paint', () => world.paintTerrain(cell, patch), { cell }); },
    addPath(spec) { return run('path.add', () => world.addPath(spec), { id: spec.id }); },
    removePath(id) { return run('path.remove', () => world.removePath(id), { id }); },
    preset(id) { return run('world.preset', () => world.applyPreset(id), { id }); },
    undo() { const changed = world.undo(); if (changed) { refresh(); emit('command', { type: 'history.undo' }); } return changed; },
    redo() { const changed = world.redo(); if (changed) { refresh(); emit('command', { type: 'history.redo' }); } return changed; },
    refresh,
  };
}
