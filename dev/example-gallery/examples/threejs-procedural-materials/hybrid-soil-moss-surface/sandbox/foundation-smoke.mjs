import { createWorldState } from './world-state.js';
import { validateWorld } from './validate-world.js';
import { createRenderRegistry } from './render-registry.js';
const w=createWorldState();w.addPlacement({id:'a',kind:'rock',anchor:{x:1,z:1},footprint:[[0,0],[1,0],[0,1]]});w.addPath({id:'p',kind:'road',cells:[{x:4,z:4},{x:5,z:4}]});const report=validateWorld(w.toJSON());if(!report.valid)throw Error(JSON.stringify(report));const r=createRenderRegistry();r.set('a',{id:'a'});r.reconcile(['a','b'],{create:id=>({id}),update:()=>{},remove:()=>{}});if(!r.has('b')||r.ids().length!==2)throw Error('registry');console.log('foundation validation and registry smoke passed');
