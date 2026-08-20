import { createWorldState } from './world-state.js';
import { createEditorCommands } from './editor-commands.js';

const world = createWorldState();
const events = [];
const commands = createEditorCommands(world, { hooks: { command: ({ type }) => events.push(type) } });
const added = commands.add({ id: 'house', kind: 'house', anchor: { x: 2, z: 2 }, footprint: [2, 2] });
if (!added.valid) throw Error('add failed');
const blocked = commands.add({ id: 'rock', kind: 'rock', anchor: { x: 2, z: 2 }, footprint: [1, 1] });
if (blocked.valid || blocked.reason !== 'occupied') throw Error('overlap accepted');
const failedMove = commands.move('house', { x: 20, z: 20 });
if (failedMove.valid || world.getPlacement('house').anchor.x !== 2) throw Error('failed move mutated state');
if (!commands.rotate('house', 1).valid) throw Error('rotation failed');
if (!commands.undo() || !commands.redo()) throw Error('history failed');
world.assertInvariants();
if (!events.includes('placement.add') || !events.includes('history.undo')) throw Error('events missing');
console.log('editor command smoke passed');
