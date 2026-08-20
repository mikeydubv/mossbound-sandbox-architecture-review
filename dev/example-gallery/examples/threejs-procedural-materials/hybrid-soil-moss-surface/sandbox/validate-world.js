import { cellKey, inBounds } from './grid.js';
import { getPlacementCells, normalizeFootprint, normalizeRotation } from './footprint.js';
import { validatePath } from './path-state.js';
export function validateWorld(snapshot) {
  const errors = [], grid = snapshot?.world?.grid;
  if (!grid || !Number.isInteger(grid.width) || !Number.isInteger(grid.depth) || !(grid.tileSize > 0)) errors.push({ code:'INVALID_GRID', path:'world.grid' });
  const placements = snapshot?.placements || [], ids = new Set(), occupancy = new Map();
  for (let i=0;i<placements.length;i++) { const p=placements[i], path=`placements[${i}]`; if (!p.id || ids.has(p.id)) errors.push({code:'DUPLICATE_PLACEMENT_ID',path}); ids.add(p.id); if (normalizeRotation(p.rotation)!==p.rotation) errors.push({code:'INVALID_ROTATION',path}); const cells=getPlacementCells(p.anchor,p.footprint,p.rotation); if (!normalizeFootprint(p.footprint).length) errors.push({code:'EMPTY_FOOTPRINT',path}); for(const c of cells){if(!inBounds(grid,c))errors.push({code:'PLACEMENT_OUT_OF_BOUNDS',path,cell:c});const key=cellKey(c);if(occupancy.has(key))errors.push({code:'PLACEMENT_OVERLAP',path,cell:c,occupantId:occupancy.get(key)});occupancy.set(key,p.id);}}
  for (let i=0;i<(snapshot?.paths||[]).length;i++){const r=validatePath(snapshot.paths[i],grid);if(!r.valid)errors.push({code:`PATH_${r.reason.toUpperCase()}`,path:`paths[${i}]`,cell:r.cell});}
  for (const t of snapshot?.terrain || []) if (!inBounds(grid,t) || !Number.isFinite(t.elevation ?? 0)) errors.push({code:'INVALID_TERRAIN_CELL',path:'terrain',cell:t});
  return { valid: errors.length===0, errors };
}
