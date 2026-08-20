export const DEFAULT_GRID = Object.freeze({ width: 12, depth: 12, tileSize: 2, origin: { x: -12, z: -12 } });
export const cellKey = ({ x, z }) => `${x},${z}`;
export const parseCellKey = (key) => { const [x, z] = String(key).split(',').map(Number); return { x, z }; };
export const isCell = (cell) => Number.isInteger(cell?.x) && Number.isInteger(cell?.z);
export const inBounds = (grid, cell) => isCell(cell) && cell.x >= 0 && cell.x < grid.width && cell.z >= 0 && cell.z < grid.depth;
export const cellToWorldCenter = (grid, cell) => ({ x: grid.origin.x + (cell.x + 0.5) * grid.tileSize, z: grid.origin.z + (cell.z + 0.5) * grid.tileSize });
export const worldToCell = (grid, world) => ({ x: Math.floor((world.x - grid.origin.x) / grid.tileSize), z: Math.floor((world.z - grid.origin.z) / grid.tileSize) });
export const allCells = (grid) => { const cells = []; for (let z = 0; z < grid.depth; z++) for (let x = 0; x < grid.width; x++) cells.push({ x, z }); return cells; };
