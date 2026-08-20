const base = (id, overrides = {}) => ({ id, version: 1, seed: 4207, grid: { width: 12, depth: 12, tileSize: 2 }, terrain: { profileId: id, waterLevel: null, elevationScale: 1 }, paths: { allowedKinds: ['road','stream'], maxWidth: 2 }, objects: { initialPlacements: [], allowedAssetKinds: [] }, environment: { sky: 'yard-day', lighting: 'warm-overcast', fog: null, water: null, vegetation: { density: 0.25 }, vfx: { fireflies: false } }, ...overrides });
export const PRESETS = Object.freeze({
  blank: base('blank', { terrain:{profileId:'blank',waterLevel:null,elevationScale:1}, environment:{sky:'editor',lighting:'neutral',fog:null,water:null,vegetation:{density:0},vfx:{fireflies:false}} }),
  yard: base('yard', { environment:{sky:'yard-day',lighting:'warm-overcast',fog:'yard',water:null,vegetation:{density:.35},vfx:{fireflies:true}} }),
  beach: base('beach', { seed:1201, terrain:{profileId:'coastal-sand',waterLevel:0,elevationScale:.5}, environment:{sky:'coastal',lighting:'warm',fog:'hazy',water:{enabled:true,level:0},vegetation:{density:.1},vfx:{foam:true,fireflies:false}} }),
  meadow: base('meadow', { terrain:{profileId:'meadow',waterLevel:null,elevationScale:1}, environment:{sky:'meadow',lighting:'soft',fog:null,water:null,vegetation:{density:.65},vfx:{fireflies:true}} }),
  snow: base('snow', { terrain:{profileId:'snow',waterLevel:null,elevationScale:1}, environment:{sky:'snow',lighting:'cold',fog:'snow',water:null,vegetation:{density:.08},vfx:{snow:true}} }),
  desert: base('desert', { terrain:{profileId:'desert',waterLevel:null,elevationScale:1}, environment:{sky:'desert',lighting:'hard',fog:'dust',water:null,vegetation:{density:.03},vfx:{dust:true}} }),
});
export const getPreset = (id) => PRESETS[id] || PRESETS.blank;
