import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  createHybridSoilMossSurface,
  setHybridSoilMossDebugMode,
} from "/skills/threejs-procedural-materials/examples/hybrid-soil-moss-surface/hybrid-soil-moss-surface.js";
import { createModelMossAccumulation } from "/skills/threejs-procedural-materials/examples/hybrid-soil-moss-surface/model-moss-accumulation.js";

const CAR_URL = "/dev/example-gallery/examples/threejs-precipitation-surfaces/snow-accumulation/assets/old_rusty_car_2.glb";

function createChippedRockGeometry(detail = 1) {
  const geometry = new THREE.IcosahedronGeometry(0.82, Math.min(2, Math.max(0, detail)));
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const n = 1 + 0.10 * Math.sin(i * 12.73) + 0.055 * Math.sin(i * 4.19 + 1.7);
    position.setXYZ(i, x * n, y * (0.88 + 0.16 * Math.sin(i * 8.1)), z * n);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createSalvageProps() {
  const group = new THREE.Group();
  const rust = new THREE.MeshStandardMaterial({ color: 0x4b2418, roughness: 0.88, metalness: 0.35 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x20262a, roughness: 0.7, metalness: 0.8 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x5b3926, roughness: 1.0 });
  const moss = new THREE.MeshStandardMaterial({ color: 0x526b36, roughness: 1.0 });
  const add = (mesh, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.scale.set(...scale);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.assetName = mesh.userData.assetName || "salvage prop";
    mesh.userData.editable = true;
    group.add(mesh); return mesh;
  };
  add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 1.5), rust), [-6.0, 0.8, -2.8], [0.04, -0.25, 0.03]);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.2), wood), [5.4, 0.55, -3.4], [0, 0.18, -0.08]);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.5, 20), darkMetal), [5.7, 0.76, 2.6], [0, 0, Math.PI * 0.5]);
  add(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.16, 8, 20), rust), [-5.2, 1.0, 3.0], [Math.PI * 0.5, 0.1, 0.2]);
  add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), moss), [-3.4, 0.55, -4.0], [0.2, 0.4, 0.1], [1.5, 0.65, 1.1]);
  return group;
}

function createBeachWater() {
  const uniforms = { uTime: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    vertexShader: `uniform float uTime; varying vec2 vUv; varying float vWave; void main(){ vUv=uv; vec3 p=position; float w=sin(p.x*1.8+uTime*1.4)*0.12+cos(p.y*2.5-uTime*1.1)*0.08; p.z += w; vWave=w; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; varying float vWave; void main(){ float bands=sin((vUv.x+vUv.y)*42.0-uTime*2.0)*0.5+0.5; vec3 deep=vec3(0.025,0.22,0.30); vec3 crest=vec3(0.22,0.72,0.72); vec3 c=mix(deep,crest,bands*0.24+max(vWave,0.0)*1.4); gl_FragColor=vec4(c,0.88); }`,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(28, 18, 48, 32), material);
  water.rotation.x = -Math.PI * 0.5;
  water.position.set(7, -0.02, 0);
  water.userData.uniforms = uniforms;
  water.userData.assetName = "animated ocean";
  return water;
}

function createBuilding() {
  const group = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ color: 0x788b92, roughness: 0.72 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x343f46, roughness: 0.65, metalness: 0.15 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x77dce4, emissive: 0x164f58, emissiveIntensity: 0.8, roughness: 0.24, metalness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.0, 3.0), wall); body.position.y = 1.5; group.add(body);
  const top = new THREE.Mesh(new THREE.ConeGeometry(2.55, 1.15, 4), roof); top.rotation.y = Math.PI * 0.25; top.position.y = 3.57; group.add(top);
  [-1, 1].forEach((x) => { const win = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.08), glass); win.position.set(x * 0.9, 1.75, -1.53); group.add(win); });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.35, 0.08), roof); door.position.set(0, 0.68, -1.55); group.add(door);
  group.userData.assetName = "building"; group.userData.assetType = "building"; group.userData.editable = true;
  group.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  return group;
}

function createFoundation() {
  const foundation = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 32, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x171a18, roughness: 0.98, metalness: 0.02 }),
  );
  foundation.rotation.x = -Math.PI * 0.5;
  foundation.position.y = -0.18;
  foundation.receiveShadow = true;
  return foundation;
}

function createPuddle() {
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(3.35, 3.55, 0.12, 48),
    new THREE.MeshStandardMaterial({ color: 0x101817, roughness: 0.96, metalness: 0.05 }),
  );
  basin.scale.z = 0.48;
  basin.position.set(-2.0, 0.05, 3.65);
  basin.receiveShadow = true;

  const uniforms = { uTime: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() { vUv = uv; vec4 world = modelMatrix * vec4(position, 1.0); vWorld = world.xyz; gl_Position = projectionMatrix * viewMatrix * world; }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vec2 p = vWorld.xz;
        float ripple = sin(length(p - vec2(-1.4, 1.0)) * 8.0 - uTime * 2.2) * 0.5 + 0.5;
        float streak = sin((p.x + p.y) * 5.0 + uTime * 0.5) * 0.5 + 0.5;
        vec3 water = mix(vec3(0.035, 0.12, 0.13), vec3(0.12, 0.34, 0.30), ripple * 0.35 + streak * 0.2);
        float edge = smoothstep(0.0, 0.16, min(min(vUv.x, vUv.y), min(1.0-vUv.x, 1.0-vUv.y)));
        gl_FragColor = vec4(water, 0.68 * edge);
      }
    `,
  });
  const puddle = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.0, 1, 1), material);
  puddle.rotation.x = -Math.PI * 0.5;
  puddle.position.set(-2.0, 0.13, 3.65);
  puddle.scale.set(1.0, 0.48, 1.0);
  puddle.receiveShadow = true;
  puddle.userData.uniforms = uniforms;
  const group = new THREE.Group();
  group.add(basin, puddle);
  group.userData.uniforms = uniforms;
  return group;
}

function createStream() {
  const group = new THREE.Group();
  const streamPath = [
    new THREE.Vector3(5.75, 0, -9.5), new THREE.Vector3(6.25, 0, -6.0),
    new THREE.Vector3(5.65, 0, -2.5), new THREE.Vector3(6.55, 0, 1.0),
    new THREE.Vector3(5.45, 0, 4.5), new THREE.Vector3(6.35, 0, 8.8),
  ];
  const makeRibbon = (width, y) => {
    const positions = [], uvs = [], indices = [];
    streamPath.forEach((p, i) => {
      const prev = streamPath[Math.max(0, i - 1)], next = streamPath[Math.min(streamPath.length - 1, i + 1)];
      const tangent = new THREE.Vector3().subVectors(next, prev).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(width * 0.5);
      positions.push(p.x - side.x, y, p.z - side.z, p.x + side.x, y, p.z + side.z);
      uvs.push(0, i / (streamPath.length - 1), 1, i / (streamPath.length - 1));
      if (i < streamPath.length - 1) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
  };
  const bed = new THREE.Mesh(
    makeRibbon(2.8, 0.035),
    new THREE.MeshStandardMaterial({ color: 0x182b2a, roughness: 0.72, metalness: 0.08 }),
  );
  bed.position.y = 0.035;
  group.add(bed);

  const uniforms = { uTime: { value: 0 }, uSpeed: { value: 1.0 } };
  const water = new THREE.Mesh(
    makeRibbon(2.25, 0.04),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: `
        uniform float uTime; uniform float uSpeed; varying vec2 vUv; varying vec3 vWorld;
        void main() { vUv=uv; vec3 p=position; p.x += sin(p.y*2.8+uTime*uSpeed)*0.07; p.z += cos(p.x*5.0+uTime*uSpeed)*0.025; vec4 w=modelMatrix*vec4(p,1.0); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }
      `,
      fragmentShader: `
        uniform float uTime; uniform float uSpeed; varying vec2 vUv; varying vec3 vWorld;
        void main() { float flow=sin(vWorld.z*4.5-uTime*uSpeed*2.8+sin(vWorld.x*5.0))*0.5+0.5; float glint=pow(max(0.0,sin(vWorld.z*8.0-uTime*uSpeed*3.5)),18.0); vec3 c=mix(vec3(0.025,0.16,0.17),vec3(0.08,0.42,0.38),flow*0.42); c+=vec3(0.2,0.85,0.75)*glint; float edge=smoothstep(0.0,0.18,min(vUv.x,1.0-vUv.x)); gl_FragColor=vec4(c,0.9*edge); }
      `,
    }),
  );
  water.position.y = 0.72;
  group.add(water);

  const bank = new THREE.MeshStandardMaterial({ color: 0x40503a, roughness: 0.98 });
  const foam = new THREE.MeshBasicMaterial({ color: 0x9ee9d4, transparent: true, opacity: 0.72 });
  [-1, 1].forEach((side) => {
    const bankStrip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 19), bank);
    bankStrip.position.set(5.95 + side * 1.35, 0.17, 0.5);
    bankStrip.rotation.y = side * 0.035;
    bankStrip.castShadow = bankStrip.receiveShadow = true;
    group.add(bankStrip);
    for (let i = 0; i < 15; i++) {
      const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + (i % 4) * 0.07, 1), i % 3 === 0 ? foam : bank);
      pebble.position.set(5.95 + side * (1.05 + (i % 3) * 0.16), 0.28 + (i % 2) * 0.08, -8.2 + i * 1.25);
      pebble.scale.y = 0.55;
      pebble.rotation.set(i * 0.4, i * 0.8, i * 0.2);
      pebble.castShadow = pebble.receiveShadow = true;
      group.add(pebble);
    }
  });
  group.position.y = 0.32;
  group.userData.uniforms = uniforms;
  group.userData.assetName = "running stream";
  group.userData.editable = true;
  return group;
}

function createEditorUI(editor) {
  const panel = document.createElement("div");
  panel.style.cssText = "position:fixed;top:14px;right:14px;width:220px;padding:14px;background:rgba(10,17,17,.9);color:#d8fff5;font:12px system-ui;z-index:20;border:1px solid #2b8277;border-radius:10px;backdrop-filter:blur(8px);box-shadow:0 8px 30px #0008";
  const tray = document.createElement("div");
  tray.id = "asset-tray";
  tray.style.cssText = "position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:8px;align-items:stretch;padding:10px;background:rgba(8,14,15,.94);border:1px solid #2b8277;border-radius:14px;z-index:21;box-shadow:0 8px 30px #0009;max-width:calc(100vw - 24px);overflow-x:auto";
  const assets = [{ id: "rock", label: "Rock", icon: "🪨" }, { id: "crate", label: "Crate", icon: "📦" }, { id: "barrel", label: "Barrel", icon: "🛢️" }, { id: "house", label: "House", icon: "🏠" }, { id: "building", label: "Building", icon: "🏢" }, { id: "tree", label: "Tree", icon: "🌲" }, { id: "lamp", label: "Lamp", icon: "💡" }, { id: "fence", label: "Fence", icon: "🪵" }, { id: "road", label: "Road", icon: "🛣️" }, { id: "car", label: "Car", icon: "🚗" }, { id: "truck", label: "Truck", icon: "🚚" }, { id: "van", label: "Van", icon: "🚐" }, { id: "stream", label: "Stream", icon: "〰️" }];
  tray.innerHTML = assets.map((asset) => `<button data-tray-spawn="${asset.id}" title="Place ${asset.label}" style="width:68px;min-width:68px;height:68px;padding:4px;border:1px solid #315f58;border-radius:9px;background:#142322;color:#d8fff5;cursor:pointer"><span style="display:block;font-size:28px;line-height:34px">${asset.icon}</span><small>${asset.label}</small></button>`).join("") + `<button data-delete-asset style="width:68px;min-width:68px;height:68px;padding:4px;border:1px solid #8a4141;border-radius:9px;background:#321b20;color:#ffd3d3;cursor:pointer"><span style="display:block;font-size:28px;line-height:34px">🗑️</span><small>Delete</small></button>`;
  document.body.appendChild(tray);
  panel.style.top = "18px";
  panel.style.maxHeight = "calc(100vh - 36px)";
  panel.style.overflowY = "auto";
  panel.innerHTML = `<b style="font-size:14px;color:#8fffe2">SALVAGE YARD BUILDER</b><div id="asset-name" style="margin:8px 0;color:#ffc875">Touch an asset to select</div><div style="border-top:1px solid #28534e;padding-top:8px"><b>ASSET PALETTE</b><div><button data-spawn="rock">+ Rock</button><button data-spawn="crate">+ Crate</button><button data-spawn="barrel">+ Barrel</button></div><div><button data-terrain="mound">Raise Tile</button><button data-terrain="lower">Lower Tile</button></div><div><button data-template="blank">Blank</button><button data-template="yard">Yard</button><button data-template="beach">Beach</button><button data-template="meadow">Grass</button><button data-template="snow">Snow</button><button data-template="desert">Desert</button></div></div><div id="asset-controls" style="display:none;border-top:1px solid #28534e;margin-top:10px;padding-top:6px"><label>Color <input id="asset-color" type="color" value="#617747"></label><label>Detail <input id="asset-detail" type="range" min="0" max="2" step="1" value="1"></label><label>Scale <input id="asset-scale" type="range" min="0.25" max="3" step="0.01" value="1"></label><label>Height <input id="asset-y" type="range" min="-1" max="8" step="0.01" value="0"></label><label>Rotation <input id="asset-rot" type="range" min="-3.14" max="3.14" step="0.01" value="0"></label><label>Roughness <input id="asset-rough" type="range" min="0" max="1" step="0.01" value="0.8"></label><label>Light brightness <input id="light-intensity" type="range" min="0" max="12" step="0.1" value="3"></label><label>Light reach <input id="light-range" type="range" min="1" max="30" step="0.5" value="8"></label><label>Stream height <input id="stream-y" type="range" min="0" max="3" step="0.01" value="0.72"></label><label>Stream speed <input id="stream-speed" type="range" min="0" max="3" step="0.01" value="1"></label></div><small style="display:block;margin-top:8px;color:#91aaa5">Click an asset to select. Drag only the selected asset. Click empty ground to orbit the camera.</small>`;
  document.body.appendChild(panel);
  panel.querySelectorAll("label").forEach((label) => { label.style.display="grid"; label.style.gridTemplateColumns="1fr 116px"; label.style.alignItems="center"; label.style.gap="8px"; label.style.margin="9px 0"; const input=label.querySelector("input"); input.style.width="116px"; input.style.boxSizing="border-box"; });
  const inputs = { color: panel.querySelector("#asset-color"), detail: panel.querySelector("#asset-detail"), scale: panel.querySelector("#asset-scale"), y: panel.querySelector("#asset-y"), rot: panel.querySelector("#asset-rot"), rough: panel.querySelector("#asset-rough"), lightIntensity: panel.querySelector("#light-intensity"), lightRange: panel.querySelector("#light-range"), streamY: panel.querySelector("#stream-y"), speed: panel.querySelector("#stream-speed"), name: panel.querySelector("#asset-name"), controls: panel.querySelector("#asset-controls") };
  editor.inputs = inputs;
  [inputs.scale, inputs.y, inputs.rot, inputs.rough, inputs.color, inputs.detail, inputs.lightIntensity, inputs.lightRange].forEach((input) => input.addEventListener("input", () => editor.apply()));
  panel.querySelectorAll("[data-spawn]").forEach((button) => button.addEventListener("click", () => editor.spawn(button.dataset.spawn)));
  tray.querySelectorAll("[data-tray-spawn]").forEach((button) => button.addEventListener("click", () => editor.spawn(button.dataset.traySpawn)));
  tray.querySelector("[data-delete-asset]").addEventListener("click", () => editor.deleteSelected());
  panel.querySelectorAll("[data-template]").forEach((button) => button.addEventListener("click", () => editor.template(button.dataset.template)));
  panel.querySelectorAll("[data-terrain]").forEach((button) => button.addEventListener("click", () => { editor.terrainMode = button.dataset.terrain; inputs.name.textContent = `${button.textContent}: click grid tiles`; inputs.name.style.color = "#ffc875"; }));
  inputs.speed.addEventListener("input", () => { editor.stream.userData.uniforms.uSpeed.value = Number(inputs.speed.value); });
  inputs.streamY.addEventListener("input", () => { editor.stream.position.y = Number(inputs.streamY.value); });
  return panel;
}

function createFireflies() {
  const positions = [];
  for (let i = 0; i < 42; i++) {
    const a = i * 2.39996, r = 3.5 + (i % 7) * 0.9;
    positions.push(Math.cos(a) * r, 1.1 + (i % 5) * 0.42, Math.sin(a) * r);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xb8ffb0, size: 0.1, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  return new THREE.Points(geometry, material);
}

function createVegetation() {
  const group = new THREE.Group();
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x486637, roughness: 1.0, side: THREE.DoubleSide });
  const reedMat = new THREE.MeshStandardMaterial({ color: 0x71884a, roughness: 0.96, side: THREE.DoubleSide });
  const blade = new THREE.PlaneGeometry(0.16, 1.25, 1, 1);
  for (let i = 0; i < 130; i++) {
    const a = i * 2.39996;
    const r = 2.8 + (i % 13) * 0.48;
    const x = Math.cos(a) * r - 0.3;
    const z = Math.sin(a) * r + 0.2;
    if (Math.abs(x) < 3.0 && Math.abs(z) < 2.0) continue;
    const mesh = new THREE.Mesh(blade, i % 5 === 0 ? reedMat : grassMat);
    mesh.position.set(x, 0.52 + (i % 3) * 0.08, z);
    mesh.rotation.set(0, a, (i % 4 - 1.5) * 0.16);
    mesh.scale.setScalar(0.65 + (i % 7) * 0.08);
    mesh.castShadow = true;
    group.add(mesh);
  }
  return group;
}

function createYardBorder() {
  const group = new THREE.Group();
  const rockMats = [
    new THREE.MeshStandardMaterial({ color: 0x34332e, roughness: 0.96, metalness: 0.05 }),
    new THREE.MeshStandardMaterial({ color: 0x514942, roughness: 0.92, metalness: 0.04 }),
    new THREE.MeshStandardMaterial({ color: 0x293634, roughness: 0.94, metalness: 0.03 }),
    new THREE.MeshStandardMaterial({ color: 0x6a543f, roughness: 0.98, metalness: 0.02 }),
  ];
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x617747, roughness: 1.0, metalness: 0.0 });
  const silhouettes = [
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.DodecahedronGeometry(1, 1),
    createChippedRockGeometry(1),
    new THREE.TetrahedronGeometry(1, 1),
  ];
  const placements = [
    [-7.4, -4.9, 1.25, 1.6, 0.72], [-5.2, -6.5, 0.7, 0.8, 0.58], [-2.3, -7.1, 1.0, 1.2, 0.75],
    [1.0, -7.0, 1.45, 1.9, 0.62], [4.0, -6.3, 0.82, 1.0, 0.78], [7.1, -4.9, 1.18, 1.5, 0.65],
    [7.6, -1.8, 0.62, 0.75, 0.9], [7.3, 2.0, 1.4, 1.8, 0.66], [6.1, 4.8, 0.9, 1.05, 0.72],
    [3.4, 6.6, 1.65, 2.2, 0.56], [0.5, 7.2, 0.72, 0.9, 0.82], [-2.8, 6.8, 1.1, 1.3, 0.7],
    [-5.5, 5.9, 0.78, 1.0, 0.84], [-7.5, 3.5, 1.55, 2.0, 0.58], [-7.7, 0.4, 0.75, 0.9, 0.8],
  ];
  placements.forEach(([x, z, size, width, squash], i) => {
    const rock = new THREE.Mesh(silhouettes[i % silhouettes.length], rockMats[i % rockMats.length]);
    rock.position.set(x, size * squash * 0.62, z);
    rock.scale.set(width, size * squash, size * (0.78 + (i % 3) * 0.12));
    rock.rotation.set(i * 0.37, i * 1.13, i * 0.23);
    rock.castShadow = rock.receiveShadow = true;
    rock.userData.assetName = `rock ${i + 1}`;
    rock.userData.assetType = "rock";
    rock.userData.detail = 1;
    rock.userData.editable = true;
    group.add(rock);

    if (i % 2 === 0) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.52, 10, 5), mossMat);
      cap.position.set(x - width * 0.16, size * squash * 1.15, z + size * 0.08);
      cap.scale.set(width * 0.9, 0.16 + (i % 3) * 0.05, size * 0.52);
      cap.rotation.y = i * 0.6;
      cap.castShadow = cap.receiveShadow = true;
      cap.userData.editTarget = rock;
      group.add(cap);
    }
  });

  // Three landmark stones create a deliberate visual rhythm around the entrance.
  const landmarks = [
    { p: [-6.0, 0.0, -6.9], s: [1.8, 2.7, 1.45], r: [0.08, -0.35, -0.12] },
    { p: [5.9, 0.0, -6.8], s: [1.35, 2.15, 1.1], r: [-0.1, 0.45, 0.16] },
    { p: [7.4, 0.0, 5.6], s: [1.2, 1.85, 1.6], r: [0.22, 0.8, -0.08] },
  ];
  landmarks.forEach(({ p, s, r }, i) => {
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 2), rockMats[(i + 1) % rockMats.length]);
    stone.position.set(p[0], s[1] * 0.48, p[2]);
    stone.scale.set(...s);
    stone.rotation.set(...r);
    stone.castShadow = stone.receiveShadow = true;
    stone.userData.assetName = `landmark rock ${i + 1}`;
    stone.userData.editable = true;
    group.add(stone);
  });
  return group;
}

function createYardSign() {
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.4, 8), new THREE.MeshStandardMaterial({ color: 0x252829, roughness: 0.8, metalness: 0.7 }));
  post.position.y = 1.2;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.08), new THREE.MeshStandardMaterial({ color: 0x172f31, emissive: 0x0a3134, emissiveIntensity: 0.35, roughness: 0.65, metalness: 0.55 }));
  plate.position.set(0, 2.15, 0);
  group.add(post, plate);
  group.position.set(-7.6, 0, -1.8);
  group.rotation.y = 0.35;
  group.traverse((o) => { o.castShadow = o.receiveShadow = true; });
  return group;
}

export default {
  renderer: {
    options: { antialias: true },
    exposure: 0.85,
    clearColor: 0x171311,
  },
  camera: { fov: 27, near: 0.1, far: 500, position: [8.5, 13.5, 25] },
  controls: {
    target: [0, 0, 0],
    minDistance: 2,
    maxDistance: 70,
    maxPolarAngle: Math.PI * 0.495,
    enablePan: true,
  },
  async setup({ renderer, scene, camera, controls }) {
    scene.background = new THREE.Color(0x29231d);
    scene.fog = new THREE.FogExp2(0x29231d, 0.003);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.4;

    const key = new THREE.DirectionalLight(0xfff1dd, 3.0);
    key.position.set(8, 12, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    key.shadow.camera.left = key.shadow.camera.bottom = -15;
    key.shadow.camera.right = key.shadow.camera.top = 15;
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.02;
    const fill = new THREE.DirectionalLight(0x6c8cff, 0.5);
    fill.position.set(-9, 5, -4);
    const rim = new THREE.SpotLight(0xffd9a0, 110, 50, Math.PI * 0.25, 0.4, 1.2);
    rim.position.set(-6, 8, -10);
    rim.target.position.set(0, 0, 0);
    scene.add(key, fill, rim, rim.target, new THREE.AmbientLight(0x3a2f24, 0.4));

    const foundation = createFoundation();
    scene.add(foundation);
    const worldGrid = new THREE.GridHelper(32, 32, 0x4c8177, 0x294842);
    worldGrid.position.y = 0.012; worldGrid.material.transparent = true; worldGrid.material.opacity = 0.32;
    scene.add(worldGrid);
    const terrainTiles = new THREE.Group(); terrainTiles.name = "editable terrain tiles"; scene.add(terrainTiles);
    const moundTiles = new Map();
    const beachSand = new THREE.Mesh(new THREE.PlaneGeometry(32, 32, 1, 1), new THREE.MeshStandardMaterial({ color: 0xd8b477, roughness: 0.98 })); beachSand.rotation.x = -Math.PI * 0.5; beachSand.position.y = -0.12; beachSand.visible = false; beachSand.receiveShadow = true; scene.add(beachSand);
    const beachWater = createBeachWater(); beachWater.visible = false; scene.add(beachWater);

    const soil = await createHybridSoilMossSurface({
      textureBaseUrl: "/skills/threejs-procedural-materials/assets/hybrid-soil-moss-surface",
      anisotropy: renderer.capabilities?.getMaxAnisotropy?.() ?? 4,
    });
    soil.castShadow = true;
    soil.visible = false;
    scene.add(soil);
    const uniforms = soil.userData.soilUniforms;
    uniforms.uMossEnabled.value = 1.0;

    const props = createSalvageProps();
    scene.add(props);
    const placedAssets = new THREE.Group();
    placedAssets.name = "user placed assets";
    scene.add(placedAssets);
    const vegetation = createVegetation();
    scene.add(vegetation);
    const border = createYardBorder();
    scene.add(border);
    const sign = createYardSign();
    scene.add(sign);
    const fireflies = createFireflies();
    scene.add(fireflies);
    const puddle = createPuddle();
    scene.add(puddle);
    const stream = createStream();
    scene.add(stream);
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 12),
      new THREE.MeshStandardMaterial({ color: 0x63d9ff, emissive: 0x1688a8, emissiveIntensity: 4.0, roughness: 0.25, metalness: 0.2 }),
    );
    beacon.position.set(0.55, 1.45, -0.25);
    beacon.castShadow = true;
    scene.add(beacon);
    const beaconLight = new THREE.PointLight(0x42d9ff, 3.5, 7, 2);
    beaconLight.position.copy(beacon.position);
    scene.add(beaconLight);

    const shared = { uTime: { value: 0 } };
    const model = createModelMossAccumulation({
      scene,
      sharedUniforms: shared,
      mossUniforms: uniforms,
      defaultUrl: CAR_URL,
    });
    await model.ready;
    model.group.position.y = 0.22;
    model.group.userData.assetName = "rusty car";
    model.group.userData.editable = true;
    model.setVisible(true);
    model.refreshMatrix();

    const editor = { selected: null, pendingKind: null, terrainMode: null, helper: null, stream, inputs: null, apply() { if (!this.selected) return; const a = this.selected; a.scale.setScalar(Number(this.inputs.scale.value)); a.position.y = Number(this.inputs.y.value); a.rotation.y = Number(this.inputs.rot.value); if (a.userData.assetType === "lamp" && a.userData.pointLight) { a.userData.pointLight.intensity = Number(this.inputs.lightIntensity.value); a.userData.pointLight.distance = Number(this.inputs.lightRange.value); } a.traverse((o) => { if (o.material?.roughness !== undefined) o.material.roughness = Number(this.inputs.rough.value); if (o.material?.color && this.inputs.color.value) o.material.color.set(this.inputs.color.value); }); if (a.userData.assetType === "rock" && a.isMesh && Number(this.inputs.detail.value) !== a.userData.detail) { const next = createChippedRockGeometry(Number(this.inputs.detail.value)); a.geometry.dispose(); a.geometry = next; a.userData.detail = Number(this.inputs.detail.value); } this.helper?.update(); }, select(object) { if (this.helper) scene.remove(this.helper); this.selected = object; this.helper = new THREE.BoxHelper(object, 0x7ffff0); scene.add(this.helper); const box = new THREE.Box3().setFromObject(object); const center = box.getCenter(new THREE.Vector3()); this.inputs.name.textContent = `SELECTED: ${object.userData.assetName || `asset @ ${center.x.toFixed(1)}, ${center.z.toFixed(1)}`}`; this.inputs.name.style.color = "#7ffff0"; this.inputs.controls.style.display = "block"; this.inputs.lightIntensity.parentElement.style.display = object.userData.pointLight ? "grid" : "none"; this.inputs.lightRange.parentElement.style.display = object.userData.pointLight ? "grid" : "none"; this.inputs.streamY.parentElement.style.display = object === stream ? "grid" : "none"; this.inputs.speed.parentElement.style.display = object === stream ? "grid" : "none"; this.inputs.scale.value = object.scale.x; this.inputs.y.value = object.position.y; this.inputs.rot.value = object.rotation.y; const first = object.getObjectByProperty("isMesh", true); if (first?.material?.color) this.inputs.color.value = `#${first.material.color.getHexString()}`; }, deleteSelected() { if (!this.selected || this.selected === stream || this.selected === model.group) return; this.selected.parent?.remove(this.selected); this.selected.traverse((o) => { o.geometry?.dispose?.(); if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.()); else o.material?.dispose?.(); }); if (this.helper) scene.remove(this.helper); this.helper = null; this.selected = null; this.inputs.name.textContent = "Asset deleted"; this.inputs.name.style.color = "#ffc875"; this.inputs.controls.style.display = "none"; }, spawn(kind, point = null) { if (kind === "stream" && !point) { this.pendingKind = kind; this.inputs.name.textContent = "PLACEMENT: click a grid tile"; return; } if (!point) { this.pendingKind = kind; this.inputs.name.textContent = `PLACEMENT: click a grid tile for ${kind}`; return; } const mat = new THREE.MeshStandardMaterial({ color: kind === "rock" ? 0x59615a : kind === "crate" ? 0x8a5a34 : kind === "house" ? 0x8c5b48 : kind === "tree" ? 0x3f6b43 : kind === "lamp" ? 0x263338 : kind === "fence" ? 0x765335 : 0x273033, roughness: 0.85, metalness: kind === "barrel" || kind === "lamp" ? 0.65 : 0.05 }); let geo; let y = 0.6; if (kind === "rock") { geo = createChippedRockGeometry(Number(this.inputs.detail?.value || 1)); y = 0.55; } else if (kind === "crate") geo = new THREE.BoxGeometry(1.3, 1.1, 1.3); else if (kind === "building") { const object = createBuilding(); object.position.set(point.x, 0, point.z); object.userData.assetName = "new building"; object.castShadow = object.receiveShadow = true; placedAssets.add(object); this.select(object); return; } else if (kind === "road") { geo = new THREE.BoxGeometry(4.5, 0.08, 12); y = 0.04; } else if (kind === "car" || kind === "truck" || kind === "van") { geo = new THREE.BoxGeometry(kind === "truck" ? 2.2 : 1.8, kind === "truck" ? 1.4 : 1.0, kind === "van" ? 3.2 : 2.8); y = kind === "truck" ? 0.7 : 0.5; } else if (kind === "barrel") geo = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 12); else if (kind === "house") { geo = new THREE.BoxGeometry(2.6, 1.8, 2.4); y = 0.9; } else if (kind === "tree") { geo = new THREE.ConeGeometry(1.0, 2.8, 7); y = 1.4; } else if (kind === "lamp") { geo = new THREE.CylinderGeometry(0.14, 0.2, 2.2, 8); y = 1.1; } else if (kind === "fence") { geo = new THREE.BoxGeometry(2.6, 1.0, 0.18); y = 0.5; } const object = new THREE.Mesh(geo, mat); object.position.set(point.x, y, point.z); object.userData.assetName = `new ${kind}`; object.userData.assetType = kind; object.userData.editable = true; if (kind === "lamp") { const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0xffa52f, emissiveIntensity: 4 })); bulb.position.y = 1.05; object.add(bulb); const lampLight = new THREE.PointLight(0xffb35c, 3, 8, 2); lampLight.position.y = 1.05; lampLight.castShadow = true; object.add(lampLight); object.userData.pointLight = lampLight; } object.userData.detail = Number(this.inputs.detail?.value || 1); object.castShadow = object.receiveShadow = true; placedAssets.add(object); this.select(object); }, template(kind) { const blank = kind === "blank"; const beach = kind === "beach"; const yard = kind === "yard"; soil.visible = !blank && !beach; foundation.visible = yard; beachSand.visible = beach; beachWater.visible = beach; props.visible = vegetation.visible = border.visible = sign.visible = fireflies.visible = puddle.visible = stream.visible = model.group.visible = beacon.visible = yard; placedAssets.visible = true; worldGrid.visible = true; if (blank) { scene.background.set(0x111817); scene.fog.color.set(0x111817); } else if (beach) { scene.background.set(0x8bc6d8); scene.fog.color.set(0x8bc6d8); } else if (kind === "meadow") { scene.background.set(0x9ab8c2); scene.fog.color.set(0x9ab8c2); foundation.visible = true; foundation.material.color.set(0x4b673d); } else if (kind === "snow") { scene.background.set(0xb9d6e2); scene.fog.color.set(0xb9d6e2); foundation.visible = true; foundation.material.color.set(0xdce8e5); } else if (kind === "desert") { scene.background.set(0xd99b62); scene.fog.color.set(0xd99b62); foundation.visible = true; foundation.material.color.set(0xb87948); } else { scene.background.set(0x29231d); scene.fog.color.set(0x29231d); foundation.material.color.set(0x171a18); } }, };
    createEditorUI(editor);
    editor.template("blank");
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    let dragging = false;
    const updatePointer = (event) => { const rect = renderer.domElement.getBoundingClientRect(); const clientX = event.clientX ?? event.touches?.[0]?.clientX; const clientY = event.clientY ?? event.touches?.[0]?.clientY; pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(pointer, camera); };
    const snap = (value) => Math.round(value);
    const pointOnGrid = () => { const point = new THREE.Vector3(); return raycaster.ray.intersectPlane(ground, point) ? point.set(snap(point.x), 0, snap(point.z)) : null; };
    const onDown = (event) => { updatePointer(event); const roots = [model.group, props, placedAssets, border, sign, stream].filter((root) => root.visible); const hits = raycaster.intersectObjects(roots, true); const hit = hits.find((entry) => { let node = entry.object; if (node.userData.editTarget) return true; while (node && node !== scene && !node.userData.editable) node = node.parent; return node?.userData.editable; }); if (hit) { let root = hit.object.userData.editTarget || hit.object; while (root && root !== scene && !root.userData.editable) root = root.parent; editor.select(root); dragging = true; if (controls) controls.enabled = false; event.preventDefault(); } else { const point = pointOnGrid(); if (editor.terrainMode && point) { const key = `${point.x},${point.z}`; const current = moundTiles.get(key); const nextHeight = Math.max(0, (current?.userData.height || 0) + (editor.terrainMode === "mound" ? 0.5 : -0.5)); if (current) { current.scale.y = Math.max(0.05, nextHeight / 0.12); current.position.y = nextHeight * 0.5 - 0.02; current.userData.height = nextHeight; } else if (nextHeight > 0) { const tile = new THREE.Mesh(new THREE.BoxGeometry(0.96, nextHeight, 0.96), new THREE.MeshStandardMaterial({ color: 0x65734c, roughness: 0.98 })); tile.position.set(point.x, nextHeight * 0.5 - 0.02, point.z); tile.userData.height = nextHeight; tile.userData.assetName = "terrain mound"; tile.userData.editable = true; tile.receiveShadow = true; terrainTiles.add(tile); moundTiles.set(key, tile); } editor.terrainMode = null; event.preventDefault(); } else if (editor.pendingKind && point) { const kind = editor.pendingKind; editor.pendingKind = null; editor.spawn(kind, point); event.preventDefault(); } else if (controls) controls.enabled = true; } };
    const onMove = (event) => { if (!dragging || !editor.selected) return; updatePointer(event); const point = pointOnGrid(); if (point) { editor.selected.position.x = point.x; editor.selected.position.z = point.z; } };
    const onUp = () => { dragging = false; if (controls) controls.enabled = true; };
    window.addEventListener("keydown", (event) => { if ((event.key === "Delete" || event.key === "Backspace") && editor.selected) { event.preventDefault(); editor.deleteSelected(); } });
    renderer.domElement.addEventListener("wheel", (event) => { event.preventDefault(); if (event.shiftKey || !editor.selected) { const factor = event.deltaY > 0 ? 1.12 : 0.89; const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor); camera.position.copy(controls.target).add(offset); } else if (editor.selected.userData.assetType !== "stream") { editor.selected.rotation.y += (event.deltaY > 0 ? 1 : -1) * 0.16; editor.inputs.rot.value = editor.selected.rotation.y; editor.helper?.update(); } }, { passive: false });
    let pinchDistance = 0;
    renderer.domElement.addEventListener("touchstart", (event) => { if (event.touches.length === 2) pinchDistance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY); }, { passive: true });
    renderer.domElement.addEventListener("touchmove", (event) => { if (event.touches.length !== 2 || !controls) return; const next = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY); const factor = pinchDistance > next ? 1.04 : 0.96; camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target); pinchDistance = next; event.preventDefault(); }, { passive: false });
    renderer.domElement.addEventListener("pointerdown", onDown); renderer.domElement.addEventListener("pointermove", onMove); renderer.domElement.addEventListener("pointerup", onUp); renderer.domElement.addEventListener("pointercancel", onUp);

    return {
      setDebugMode(mode) {
        setHybridSoilMossDebugMode(soil, mode);
        model.setVisible(mode !== "ground-only");
      },
      update({ elapsed }) {
        shared.uTime.value = elapsed;
        fireflies.rotation.y = elapsed * 0.025;
        puddle.userData.uniforms.uTime.value = elapsed;
        stream.userData.uniforms.uTime.value = elapsed; beachWater.userData.uniforms.uTime.value = elapsed;
        const pulse = 0.65 + Math.sin(elapsed * 2.4) * 0.35;
        beacon.material.emissiveIntensity = 2.5 + pulse * 2.0;
        beaconLight.intensity = 2.2 + pulse * 2.0;
        if (controls) {
          controls.target.y = Math.max(0, controls.target.y);
          camera.position.y = Math.max(0.3, camera.position.y);
          controls.update();
        }
        model.refreshMatrix();
        editor.helper?.update();
      },
      metrics() {
        return {
          moundCoverage: uniforms.uMoundCoverage.value.toFixed(2),
          mossCoverage: uniforms.uMossCoverage.value.toFixed(2),
          model: "rusty car",
        };
      },
      dispose() {
        model.dispose();
        props.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
        vegetation.traverse((object) => { object.geometry?.dispose?.(); });
        vegetation.children[0]?.material?.dispose?.();
        vegetation.children[1]?.material?.dispose?.();
        border.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
        sign.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
        fireflies.geometry.dispose();
        fireflies.material.dispose();
        puddle.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
        stream.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
        document.querySelector("body > div[style*='SALVAGE']")?.remove();
        foundation.geometry.dispose();
        foundation.material.dispose();
        beacon.geometry.dispose();
        beacon.material.dispose();
        beaconLight.removeFromParent();
        soil.userData.disposeSoil();
        environment.dispose();
        pmrem.dispose();
      },
    };
  },
};
