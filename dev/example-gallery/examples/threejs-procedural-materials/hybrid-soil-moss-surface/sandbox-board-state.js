/** Compatibility facade: the scene keeps its old board API while the new world foundation owns mutations. */
import { createWorldState } from './sandbox/world-state.js';
import { cellToWorldCenter, worldToCell as gridWorldToCell, cellKey as makeCellKey, inBounds } from './sandbox/grid.js';
import { getPlacementCells, normalizeRotation as normalizeQuarter, rotationRadians } from './sandbox/footprint.js';
export const BOARD_WIDTH = 12, BOARD_HEIGHT = 12, TILE_SIZE = 2;
export const boardToWorld = (cell, board = {}) => cellToWorldCenter({ width: board.width ?? BOARD_WIDTH, depth: board.height ?? BOARD_HEIGHT, tileSize: board.tileSize ?? TILE_SIZE, origin: board.origin ?? { x: -(board.width ?? BOARD_WIDTH) * (board.tileSize ?? TILE_SIZE) / 2, z: -(board.height ?? BOARD_HEIGHT) * (board.tileSize ?? TILE_SIZE) / 2 } }, cell);
export const worldToCell = (world, board = {}) => gridWorldToCell({ width: board.width ?? BOARD_WIDTH, depth: board.height ?? BOARD_HEIGHT, tileSize: board.tileSize ?? TILE_SIZE, origin: board.origin ?? { x: -(board.width ?? BOARD_WIDTH) * (board.tileSize ?? TILE_SIZE) / 2, z: -(board.height ?? BOARD_HEIGHT) * (board.tileSize ?? TILE_SIZE) / 2 } }, world);
export const getFootprintCells = (anchor, footprint, rotation) => getPlacementCells(anchor, footprint, rotation);
// Public compatibility boundary: logical state stores quarter-turns; Three.js uses radians.
export const normalizeQuarterTurn = normalizeQuarter;
export const normalizeRotation = rotationRadians; // radians for legacy scene consumers
export const quarterTurns = normalizeQuarter;
export const validatePlacement = (board, spec = {}) => { const cells = getFootprintCells(spec.anchor, spec.footprint || [1,1], spec.rotation); const out = cells.find(c => !board.inBounds(c)); if (out) return { valid:false, reason:'bounds', cell:out, cells }; const hit = cells.find(c => { const id=board.occupied.get(c.key); return id && id !== spec.ignoreId; }); return hit ? {valid:false,reason:'occupied',cell:hit,cells} : {valid:true,reason:null,cells}; };

export function createHistory() { return { length: 0, clear() {} }; }
export function createBoardState(options = {}) {
  const world = createWorldState({ presetId: options.presetId || 'blank', grid: { width: options.width ?? BOARD_WIDTH, depth: options.height ?? BOARD_HEIGHT, tileSize: options.tileSize ?? TILE_SIZE, origin: options.origin } });
  const board = {
    width: world.grid.width, height: world.grid.depth, tileSize: world.grid.tileSize, origin: world.grid.origin,
    objects: world.state.placements, occupied: world.state.occupancy, terrain: world.state.terrain, history: world.state,
    inBounds(cell) { return inBounds(world.grid, cell); }, boardToWorld(cell) { return world.boardToWorld(cell); }, worldToCell(pos) { return world.worldToCell(pos); }, footprintCells(anchor, footprint, rotation) { return getFootprintCells(anchor, footprint, rotation); }, validatePlacement(spec) { return validatePlacement(board, spec); },
    add(spec, useHistory = true) { return world.addPlacement(spec, { history: useHistory }); },
    remove(id, useHistory = true) { return world.removePlacement(id, { history: useHistory }); },
    move(id, anchor, useHistory = true) { return world.movePlacement(id, anchor, { history: useHistory }); },
    rotate(id, rotation, useHistory = true) { return world.rotatePlacement(id, normalizeRotation(rotation), { history: useHistory }); },
    setTerrain(cell, patch, useHistory = true) { return world.paintTerrain(cell, patch, { history: useHistory }); },
    clear(useHistory = true) { const snapshot = world.toJSON(); const result = world.applyPreset('blank'); if (!useHistory) { world.state.history.length = 0; world.state.redo.length = 0; } return result || snapshot; },
    occupiedCells() { return [...board.occupied.keys()]; }, assertInvariants() { return world.assertInvariants(); }, toJSON() { return world.toJSON(); }, load(snapshot) { world.load(snapshot); return board; },
  };
  return board;
}
export const cellKey = makeCellKey;
