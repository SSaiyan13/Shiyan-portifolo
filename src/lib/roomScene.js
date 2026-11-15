import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// The 3D hero: one room, built here piece by piece and lit by one set of lights,
// so the walls, the furniture and everything pinned up share the same light and
// cast shadows on each other. Units are metres; the back wall is z = 0, the
// floor y = 0, and the camera stands at the front of the room looking back.

export const IMG_W = 1537, IMG_H = 1023; // shape of the still picture used when 3D can't run
const ROOM = { x: 1.72, top: 2.6, front: 4.3 };

// Camera. It orbits a point above the desk: `az` is the turn left/right, `el`
// the tilt, both in radians; zoom moves it closer. Wide screens show the whole
// room; phones stand closer, on the desk and the bass.
const VIEW = {
  dist: 3.5, el: 0.17,
  wide: { tx: 0.02, ty: 0.88, halfW: 1.86 },
  phone: { tx: 0.42, ty: 0.98, halfW: 1.32 },
  minHalfH: 1.0, // very wide windows still show the top row of polaroids
  az: 0.44, elMin: 0.02, elMax: 0.36, zoomMax: 2.3
};
const MOVE = {
  ease: 0.085, drag: 0.4,
  parallax: [0.075, 0.035], // how far the mouse alone turns the camera
  focus: 0.07, memoriesZoom: 0.52, dive: 0.42,
  zoomSnap: 1.06, introDelay: 250, introMs: 1800
};

const PINK = new THREE.Color(0xc2185b);
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// Posters above the laptop: two rows of three.
const POSTERS = ['spider-verse', 'dark-knight', 'uncharted', 'haikyuu', 'rooftop', 'leo'].map((n) => `/assets/poster-${n}.webp`);
// Polaroids, in loose rows as [x, y, count] on the back wall; the last six hang
// on the right wall above the bass.
const MEMORY_FILES = Array.from({ length: 31 }, (_, i) => `/assets/memory-${String(i + 1).padStart(2, '0')}.webp`);
const MEMORY_ROWS = [[0.76, 1.76, 6], [0.69, 1.58, 7], [0.76, 1.4, 6], [1.0, 1.22, 4]];
const POLAROID = { w: 0.115, h: 0.141, step: 0.147 };

// ---- textures drawn in code ------------------------------------------------

function canvasTexture(w, h, draw, repeat) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(...repeat);
  }
  return tex;
}
// A repeatable pseudo-random sequence, so the room looks the same every visit.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const woodTexture = (base, dark, planks, repeat) => canvasTexture(512, 512, (c, w, h) => {
  const r = rng(7);
  c.fillStyle = base;
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    c.strokeStyle = `rgba(${dark},${0.03 + r() * 0.09})`;
    c.lineWidth = 0.6 + r() * 1.6;
    const y = r() * h, x = r() * w, len = 60 + r() * 260;
    c.beginPath();
    c.moveTo(x, y);
    c.bezierCurveTo(x + len / 3, y + (r() - 0.5) * 5, x + (2 * len) / 3, y + (r() - 0.5) * 5, x + len, y + (r() - 0.5) * 3);
    c.stroke();
  }
  if (planks) {
    for (let i = 0; i < planks; i++) {
      const y = (i / planks) * h;
      c.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.14})`;
      c.fillRect(0, y, w, h / planks);
      c.fillStyle = 'rgba(0,0,0,.5)';
      c.fillRect(0, y, w, 1.5);
      c.fillRect(r() * w, y, 1.5, h / planks);
    }
  }
}, repeat);

const speckleTexture = (base, speck, amount, repeat, alpha = 0.09, size = 3) => canvasTexture(512, 512, (c, w, h) => {
  const r = rng(11);
  c.fillStyle = base;
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < amount; i++) {
    c.fillStyle = `rgba(${speck},${r() * alpha})`;
    const s = 1 + r() * size;
    c.fillRect(r() * w, r() * h, s, s);
  }
}, repeat);

// The laptop: an editor with a file list, tabs and coloured code.
const codeTexture = () => canvasTexture(1024, 660, (c, w, h) => {
  const r = rng(3);
  c.fillStyle = '#0c0f13';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#12161c';
  c.fillRect(0, 0, 170, h);
  c.fillRect(0, 0, w, 34);
  c.fillStyle = '#1c222b';
  c.fillRect(182, 6, 150, 28);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(22 + i * 22, 17, 6, 0, 7);
    c.fill();
  });
  for (let i = 0; i < 17; i++) {
    c.fillStyle = i === 4 ? '#4b5566' : '#2a313c';
    c.fillRect(18 + (i % 3 === 1 ? 14 : 0), 56 + i * 30, 60 + r() * 70, 9);
  }
  const cols = ['#c792ea', '#82aaff', '#c3e88d', '#f78c6c', '#89ddff', '#e6e6e6', '#e6e6e6', '#ffcb6b'];
  let indent = 0;
  for (let i = 0; i < 26; i++) {
    const y = 58 + i * 22.5;
    c.fillStyle = '#39414d';
    c.fillRect(192, y, 14, 8);
    if (r() < 0.12) continue;
    indent = clamp(indent + (r() < 0.3 ? 1 : r() < 0.42 ? -1 : 0), 0, 4);
    let x = 228 + indent * 26;
    const words = 1 + Math.floor(r() * 5);
    for (let k = 0; k < words && x < w - 140; k++) {
      const len = 24 + r() * 110;
      c.fillStyle = cols[Math.floor(r() * cols.length)];
      c.fillRect(x, y, len, 8);
      x += len + 12;
    }
  }
  c.fillStyle = '#7a1140';
  c.fillRect(0, h - 22, w, 22);
});

// The tablet: a flow diagram.
const diagramTexture = () => canvasTexture(640, 440, (c, w, h) => {
  c.fillStyle = '#0d1014';
  c.fillRect(0, 0, w, h);
  const nodes = [[70, 60], [270, 40], [470, 70], [150, 190], [370, 180], [80, 320], [280, 320], [480, 300]];
  const links = [[0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [3, 6], [4, 6], [4, 7]];
  c.strokeStyle = '#59606b';
  c.lineWidth = 3;
  for (const [a, b] of links) {
    const [x0, y0] = nodes[a], [x1, y1] = nodes[b];
    c.beginPath();
    c.moveTo(x0 + 60, y0 + 62);
    c.bezierCurveTo(x0 + 60, y0 + 110, x1 + 60, y1 - 50, x1 + 60, y1);
    c.stroke();
  }
  nodes.forEach(([x, y], i) => {
    c.fillStyle = '#171c23';
    c.strokeStyle = i === 4 ? '#e0a6be' : '#6a7280';
    c.beginPath();
    c.roundRect(x, y, 120, 62, 10);
    c.fill();
    c.stroke();
    c.fillStyle = '#9aa3b2';
    c.fillRect(x + 16, y + 18, 62, 7);
    c.fillStyle = '#4c5563';
    c.fillRect(x + 16, y + 36, 86, 6);
  });
});

const glowTexture = () => canvasTexture(128, 128, (c, w) => {
  const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, w, w);
});

// ---- the room --------------------------------------------------------------

export function mountRoom(canvas, { lite = false, phone = false, intro: glideIn = false, onReady, onLayout, onFail } = {}) {
  const dead = { setPointer() {}, gestureStart() {}, gesture() {}, gestureEnd() {}, zoomBy() {}, reset() {}, setFocus() {}, toggleLamp() {}, destroy() {} };
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: lite ? 'default' : 'high-performance' });
  } catch {
    onFail?.();
    return dead;
  }
  renderer.setClearColor(0x0b0d0c);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Nothing that casts a shadow moves except the chair, so shadows are redrawn only when it turns.
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(42, 1.5, 0.1, 20);
  const disposables = [];
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const mat = (color, roughness = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
    disposables.push(m);
    if (m.map) {
      m.map.anisotropy = aniso;
      disposables.push(m.map);
    }
    return m;
  };
  // Adds a mesh to `parent` at a position; shadows are on unless turned off.
  const mesh = (parent, geo, material, [x, y, z] = [0, 0, 0], { cast = true, receive = true } = {}) => {
    disposables.push(geo);
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = receive;
    parent.add(m);
    return m;
  };
  const box = (parent, w, h, d, material, at, r = 0.008, opts) => mesh(parent, r ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.01, h / 2.01, d / 2.01)) : new THREE.BoxGeometry(w, h, d), material, at, opts);
  const cyl = (parent, rTop, rBottom, h, material, at, seg = 20, opts) => mesh(parent, new THREE.CylinderGeometry(rTop, rBottom, h, seg), material, at, opts);
  // A round bar between two points.
  const rod = (parent, a, b, r, material) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const m = mesh(parent, new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 10), material, va.clone().add(vb).multiplyScalar(0.5).toArray());
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.sub(va).normalize());
    return m;
  };
  const group = (parent, [x, y, z] = [0, 0, 0], ry = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    parent.add(g);
    return g;
  };
  const glowTex = glowTexture();
  disposables.push(glowTex);
  const glow = (parent, color, size, at, opacity = 0.5) => {
    const m = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
    disposables.push(m);
    const s = new THREE.Sprite(m);
    s.scale.set(size, size, 1);
    s.position.set(...at);
    parent.add(s);
    return s;
  };

  // Shared materials.
  const M = {
    wall: mat(0xffffff, 0.95, { map: speckleTexture('#a09892', '60,50,48', 9000, [2, 1.4], 0.045, 1.6) }),
    ceiling: mat(0x6f6a68, 1),
    floor: mat(0xffffff, 0.62, { map: woodTexture('#6b4226', '25,12,4', 7, [3, 3]) }),
    rug: mat(0xffffff, 1, { map: speckleTexture('#3b3b40', '210,210,220', 5000, [4, 3]) }),
    trim: mat(0xa9a39c, 0.7),
    desk: mat(0xffffff, 0.5, { map: woodTexture('#7a4a28', '30,14,4', 0, [2, 1]) }),
    steel: mat(0x16161a, 0.45, { metalness: 0.6 }),
    black: mat(0x15151a, 0.6),
    soft: mat(0x2b2b33, 0.95),
    alu: mat(0x8f939b, 0.35, { metalness: 0.85 }),
    cream: mat(0xe9e2d5, 0.6),
    white: mat(0xf1efea, 0.5),
    duvet: mat(0x4a4b55, 1),
    sheet: mat(0x77777f, 1),
    bedWood: mat(0x3d2c21, 0.7),
    leaf: mat(0x4f7d3a, 0.8),
    leafDark: mat(0x2f5a30, 0.8),
    pot: mat(0x4a4d55, 0.6),
    clay: mat(0x8b5a2b, 0.5, { metalness: 0.5 })
  };

  // -- shell: walls, floor, ceiling --
  const shell = group(scene);
  const plane = (w, h, material, at, rot) => {
    const m = mesh(shell, new THREE.PlaneGeometry(w, h), material, at, { cast: false });
    m.rotation.set(...rot);
    return m;
  };
  const depth = ROOM.front, W = ROOM.x * 2;
  plane(W, ROOM.top, M.wall, [0, ROOM.top / 2, 0], [0, 0, 0]);
  plane(depth, ROOM.top, M.wall, [-ROOM.x, ROOM.top / 2, depth / 2], [0, Math.PI / 2, 0]);
  plane(depth, ROOM.top, M.wall, [ROOM.x, ROOM.top / 2, depth / 2], [0, -Math.PI / 2, 0]);
  plane(W, ROOM.top, M.wall, [0, ROOM.top / 2, depth], [0, Math.PI, 0]);
  plane(W, depth, M.floor, [0, 0, depth / 2], [-Math.PI / 2, 0, 0]);
  plane(W, depth, M.ceiling, [0, ROOM.top, depth / 2], [Math.PI / 2, 0, 0]);
  box(shell, W, 0.09, 0.016, M.trim, [0, 0.045, 0.008], 0.004);
  box(shell, 0.016, 0.09, depth, M.trim, [-ROOM.x + 0.008, 0.045, depth / 2], 0.004);
  box(shell, 0.016, 0.09, depth, M.trim, [ROOM.x - 0.008, 0.045, depth / 2], 0.004);
  box(shell, 2.2, 0.012, 1.9, M.rug, [0.4, 0.006, 1.55], 0.005, { cast: false });

  // -- desk --
  const DESK_Y = 0.75;
  const desk = group(scene, [0.12, 0, 0.44]);
  box(desk, 1.6, 0.05, 0.74, M.desk, [0, DESK_Y - 0.025, 0], 0.012);
  for (const sx of [-0.75, 0.75]) {
    box(desk, 0.035, 0.7, 0.035, M.steel, [sx, 0.35, -0.3], 0.004);
    box(desk, 0.035, 0.7, 0.035, M.steel, [sx, 0.35, 0.3], 0.004);
    box(desk, 0.035, 0.035, 0.6, M.steel, [sx, 0.02, 0], 0.004);
  }
  const drawers = group(desk, [-0.46, 0, 0.02]);
  box(drawers, 0.42, 0.62, 0.56, M.black, [0, 0.33, 0], 0.012);
  for (let i = 0; i < 3; i++) {
    box(drawers, 0.39, 0.185, 0.01, M.soft, [0, 0.13 + i * 0.2, 0.283], 0.004);
    box(drawers, 0.12, 0.012, 0.012, M.steel, [0, 0.19 + i * 0.2, 0.292], 0.004);
  }

  // Things that react to the pointer: each is a group whose materials are its
  // own, so it can be lit up without lighting anything else.
  const hot = {};
  const interactive = (key, g, glowAt, glowSize) => {
    const mats = [];
    g.traverse((o) => {
      if (!o.isMesh || o.material.userData.screen) return;
      o.material = o.material.clone();
      disposables.push(o.material);
      mats.push([o.material, o.material.emissive.clone()]);
    });
    hot[key] = { group: g, mats, box: new THREE.Box3().setFromObject(g), h: 0, halo: glow(g.parent, 0xd81b60, glowSize, glowAt, 0) };
  };

  // -- laptop --
  const laptop = group(scene, [0.1, DESK_Y, 0.36]);
  laptop.scale.setScalar(1.4);
  box(laptop, 0.36, 0.014, 0.245, M.alu, [0, 0.007, 0.03], 0.005);
  box(laptop, 0.3, 0.002, 0.11, M.black, [0, 0.0145, 0.0], 0, { cast: false });
  box(laptop, 0.11, 0.002, 0.065, mat(0x7d8189, 0.4, { metalness: 0.8 }), [0, 0.0145, 0.1], 0, { cast: false });
  const lid = group(laptop, [0, 0.014, -0.09]);
  lid.rotation.x = -0.24;
  box(lid, 0.36, 0.235, 0.008, M.alu, [0, 0.1175, 0], 0.004);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.4, emissive: 0xffffff, emissiveMap: codeTexture(), emissiveIntensity: 1.0 });
  screenMat.userData.screen = true;
  screenMat.emissiveMap.anisotropy = aniso;
  disposables.push(screenMat, screenMat.emissiveMap);
  mesh(lid, new THREE.PlaneGeometry(0.34, 0.215), screenMat, [0, 0.1175, 0.0045], { cast: false, receive: false });
  interactive('work', laptop, [0.1, DESK_Y + 0.18, 0.08], 1.3);

  // -- tablet on its stand, and the pencil --
  const tablet = group(scene, [-0.36, DESK_Y, 0.54], 0.42);
  tablet.scale.setScalar(1.2);
  const slab = group(tablet, [0, 0.012, 0]);
  slab.rotation.x = -0.5;
  box(slab, 0.27, 0.19, 0.008, M.black, [0, 0.095, 0], 0.004);
  const padMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.35, emissive: 0xffffff, emissiveMap: diagramTexture(), emissiveIntensity: 0.6 });
  padMat.userData.screen = true;
  disposables.push(padMat, padMat.emissiveMap);
  mesh(slab, new THREE.PlaneGeometry(0.25, 0.172), padMat, [0, 0.095, 0.0045], { cast: false, receive: false });
  const prop = box(tablet, 0.2, 0.13, 0.006, M.soft, [0, 0.06, -0.115], 0.003);
  prop.rotation.x = 0.5;
  const pencil = cyl(scene, 0.0045, 0.0045, 0.165, M.white, [-0.2, DESK_Y + 0.0045, 0.7], 10);
  pencil.rotation.set(Math.PI / 2, 0, 1.2);

  // -- framed portrait and the little plant beside it --
  const loader = new THREE.TextureLoader();
  const picture = (file) => {
    const tex = loader.load(file, () => invalidate(), undefined, () => {});
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = aniso;
    disposables.push(tex);
    return tex;
  };
  const portraitTex = picture('/assets/room-portrait.webp');
  // The photo carries a little light of its own, so the face reads in a dim room.
  const portraitMat = mat(0xffffff, 0.55, { map: portraitTex, emissive: 0xffffff, emissiveMap: portraitTex, emissiveIntensity: 0.22 });
  portraitMat.userData.screen = true;
  const portrait = group(scene, [0.66, DESK_Y, 0.3], -0.16);
  portrait.scale.setScalar(1.3);
  const frame = group(portrait, [0, 0, 0]);
  frame.rotation.x = -0.13;
  box(frame, 0.285, 0.35, 0.02, M.black, [0, 0.175, 0], 0.004);
  mesh(frame, new THREE.PlaneGeometry(0.25, 0.31), portraitMat, [0, 0.175, 0.0105], { cast: false });
  const leg = box(portrait, 0.05, 0.25, 0.006, M.black, [0, 0.12, -0.06], 0.002);
  leg.rotation.x = 0.3;
  interactive('about', portrait, [0.66, DESK_Y + 0.23, 0.1], 1.15);

  const succulent = (parent, at, s = 1) => {
    const g = group(parent, at);
    cyl(g, 0.05 * s, 0.038 * s, 0.075 * s, M.pot, [0, 0.0375 * s, 0], 20);
    const r = rng(5);
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2 + r(), tilt = 0.25 + r() * 0.75, len = (0.06 + r() * 0.05) * s;
      const leaf = mesh(g, new THREE.ConeGeometry(0.014 * s, len, 5), i % 3 ? M.leaf : M.leafDark, [Math.sin(a) * tilt * len * 0.5, 0.075 * s + Math.cos(tilt) * len * 0.5, Math.cos(a) * tilt * len * 0.5]);
      leaf.rotation.set(Math.cos(a) * tilt, 0, -Math.sin(a) * tilt);
    }
    return g;
  };
  succulent(scene, [0.9, DESK_Y, 0.5], 1.15);

  // -- desk lamp: clamp, two arms, shade and bulb --
  const LAMP = [-0.6, DESK_Y, 0.14];
  const lamp = group(scene, LAMP);
  cyl(lamp, 0.06, 0.07, 0.022, M.black, [0, 0.011, 0], 24);
  const elbow = [-0.2, 0.4, -0.02], wrist = [-0.02, 0.72, 0.04];
  rod(lamp, [0, 0.02, 0], elbow, 0.009, M.black);
  rod(lamp, elbow, wrist, 0.009, M.black);
  mesh(lamp, new THREE.SphereGeometry(0.018, 12, 10), M.steel, elbow);
  // The shade opens down and toward the middle of the desk.
  const head = group(lamp, wrist);
  head.rotation.z = 0.7;
  head.rotation.x = 0.2;
  const shade = mesh(head, new THREE.CylinderGeometry(0.036, 0.1, 0.14, 28, 1, true), mat(0x121216, 0.5, { side: THREE.DoubleSide }), [0, -0.07, 0]);
  shade.castShadow = false;
  cyl(head, 0.037, 0.037, 0.035, M.black, [0, 0.015, 0], 20);
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, emissive: 0xffd9a8, emissiveIntensity: 2.2 });
  bulbMat.userData.screen = true;
  disposables.push(bulbMat);
  mesh(head, new THREE.SphereGeometry(0.04, 16, 12), bulbMat, [0, -0.09, 0], { cast: false, receive: false });
  const BULB = new THREE.Vector3(LAMP[0] + wrist[0] + 0.07, LAMP[1] + wrist[1] - 0.08, LAMP[2] + wrist[2] + 0.02);
  const lampGlow = glow(scene, 0xffb469, 0.55, BULB.toArray(), 0.5);
  interactive('lamp', lamp, [BULB.x, BULB.y, BULB.z], 0.6);

  // -- wall shelf: plant, books, camera --
  const shelf = group(scene, [-0.3, 1.08, 0.11]);
  box(shelf, 0.52, 0.028, 0.2, M.desk, [0, 0, 0], 0.006);
  box(shelf, 0.02, 0.1, 0.13, M.steel, [-0.17, -0.06, -0.02], 0.003);
  box(shelf, 0.02, 0.1, 0.13, M.steel, [0.17, -0.06, -0.02], 0.003);
  succulent(shelf, [-0.18, 0.014, 0.01], 1.05);
  [[0x24262c, 0.21, 0.034], [0x3b2c22, 0.2, 0.04], [0xd8cdb8, 0.185, 0.03], [0x1c2a36, 0.2, 0.036]].forEach(([c, h, w], i) => {
    const b = box(shelf, w, h, 0.14, mat(c, 0.75), [-0.07 + i * 0.041, 0.014 + h / 2, 0], 0.003);
    if (i === 3) b.rotation.z = -0.12;
  });
  const camBody = group(shelf, [0.17, 0.014, 0.02], -0.3);
  box(camBody, 0.11, 0.07, 0.045, M.black, [0, 0.035, 0], 0.008);
  box(camBody, 0.04, 0.02, 0.04, M.steel, [0, 0.078, 0], 0.004);
  const lens = cyl(camBody, 0.026, 0.028, 0.04, M.steel, [0.005, 0.035, 0.04], 20);
  lens.rotation.x = Math.PI / 2;

  // -- chair, seen from behind; it swivels a little with the pointer --
  const chair = group(scene, [0.34, 0, 1.22]);
  const seat = group(chair, [0, 0, 0]);
  box(seat, 0.5, 0.075, 0.48, M.soft, [0, 0.47, 0], 0.03);
  const back = box(seat, 0.46, 0.42, 0.045, M.soft, [0, 0.7, 0.25], 0.045);
  back.rotation.x = 0.1;
  box(seat, 0.5, 0.05, 0.05, M.black, [0, 0.5, 0.255], 0.02);
  for (const sx of [-0.28, 0.28]) {
    box(seat, 0.03, 0.2, 0.035, M.black, [sx, 0.55, 0.06], 0.006);
    box(seat, 0.065, 0.028, 0.24, M.black, [sx, 0.655, 0.02], 0.012);
  }
  cyl(chair, 0.025, 0.03, 0.34, M.steel, [0, 0.27, 0], 14);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const arm = box(chair, 0.045, 0.03, 0.31, M.black, [Math.sin(a) * 0.16, 0.085, Math.cos(a) * 0.16], 0.01);
    arm.rotation.y = a;
    mesh(chair, new THREE.SphereGeometry(0.03, 10, 8), M.black, [Math.sin(a) * 0.31, 0.03, Math.cos(a) * 0.31]);
  }

  // -- bed along the left wall, with a warm strip of light behind the headboard --
  const bed = group(scene, [-1.27, 0, 1.22]);
  box(bed, 0.9, 0.26, 2.14, M.bedWood, [0, 0.15, 0], 0.02);
  box(bed, 0.9, 0.95, 0.07, M.bedWood, [0, 0.475, -1.1], 0.02);
  box(bed, 0.86, 0.2, 2.04, M.sheet, [0, 0.37, 0.02], 0.07);
  box(bed, 0.92, 0.14, 1.5, M.duvet, [0.005, 0.46, 0.3], 0.065);
  const pillow = box(bed, 0.6, 0.12, 0.38, M.sheet, [-0.02, 0.5, -0.8], 0.058);
  pillow.rotation.x = 0.1;
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x201008, emissive: 0xff8a3a, emissiveIntensity: 2.4 });
  ledMat.userData.screen = true;
  disposables.push(ledMat);
  mesh(bed, new THREE.BoxGeometry(0.82, 0.012, 0.012), ledMat, [0, 0.93, -1.145], { cast: false, receive: false });

  const ledGlow = glow(scene, 0xff7a2e, 1, [-1.27, 1.0, 0.03], 0.5);
  ledGlow.scale.set(1.5, 0.55, 1);

  // -- bass guitar on its stand --
  const bass = group(scene, [1.3, 0.1, 0.4], -0.3);
  const lean = group(bass, [0, 0, 0]);
  lean.rotation.x = -0.14;
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(0, -0.25);
  bodyShape.bezierCurveTo(0.19, -0.26, 0.23, -0.06, 0.15, 0.04);
  bodyShape.bezierCurveTo(0.11, 0.09, 0.12, 0.13, 0.15, 0.17);
  bodyShape.bezierCurveTo(0.17, 0.23, 0.12, 0.28, 0.07, 0.22);
  bodyShape.lineTo(0.036, 0.19);
  bodyShape.lineTo(-0.036, 0.19);
  bodyShape.bezierCurveTo(-0.07, 0.22, -0.1, 0.37, -0.16, 0.32);
  bodyShape.bezierCurveTo(-0.2, 0.26, -0.13, 0.14, -0.14, 0.06);
  bodyShape.bezierCurveTo(-0.23, -0.04, -0.2, -0.26, 0, -0.25);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: 0.032, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 24 });
  mesh(lean, bodyGeo, mat(0x101116, 0.22), [0, 0.3, -0.016]);
  const guard = new THREE.Shape();
  guard.moveTo(-0.02, -0.17);
  guard.bezierCurveTo(0.14, -0.2, 0.17, -0.05, 0.1, 0.03);
  guard.bezierCurveTo(0.08, 0.08, 0.09, 0.13, 0.1, 0.17);
  guard.lineTo(0.036, 0.17);
  guard.lineTo(-0.036, 0.17);
  guard.bezierCurveTo(-0.08, 0.14, -0.1, 0.02, -0.02, -0.17);
  mesh(lean, new THREE.ExtrudeGeometry(guard, { depth: 0.003, bevelEnabled: false, curveSegments: 16 }), M.cream, [0, 0.3, 0.025], { cast: false });
  box(lean, 0.062, 0.7, 0.022, mat(0xc9a36b, 0.5), [0, 0.3 + 0.5, 0.012], 0.006);
  box(lean, 0.056, 0.66, 0.006, mat(0x3a2418, 0.6), [0, 0.3 + 0.5, 0.026], 0.002);
  for (let i = 0; i < 12; i++) box(lean, 0.056, 0.0025, 0.0075, M.alu, [0, 0.3 + 0.82 - i * (0.058 - i * 0.0022), 0.0265], 0, { cast: false });
  const stock = new THREE.Shape();
  stock.moveTo(-0.032, 0);
  stock.lineTo(0.032, 0);
  stock.bezierCurveTo(0.05, 0.05, 0.05, 0.12, 0.03, 0.17);
  stock.bezierCurveTo(0, 0.2, -0.06, 0.17, -0.07, 0.11);
  stock.bezierCurveTo(-0.075, 0.05, -0.04, 0.03, -0.032, 0);
  mesh(lean, new THREE.ExtrudeGeometry(stock, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 12 }), mat(0xc9a36b, 0.5), [0, 0.3 + 0.85, 0.004]);
  for (let i = 0; i < 4; i++) {
    const peg = cyl(lean, 0.008, 0.008, 0.012, M.alu, [-0.035 + i * 0.012, 0.3 + 0.885 + i * 0.03, 0.028], 10);
    peg.rotation.x = Math.PI / 2;
    box(lean, 0.03, 0.02, 0.004, M.alu, [-0.085 + i * 0.006, 0.3 + 0.885 + i * 0.03, 0.01], 0.002);
    box(lean, 0.0018, 0.93, 0.0018, M.alu, [-0.021 + i * 0.014, 0.3 + 0.36, 0.031], 0, { cast: false });
  }
  box(lean, 0.085, 0.03, 0.012, M.black, [-0.004, 0.3 + 0.02, 0.03], 0.003);
  box(lean, 0.085, 0.03, 0.012, M.black, [0.004, 0.3 - 0.02, 0.03], 0.003);
  box(lean, 0.085, 0.05, 0.012, M.alu, [0, 0.3 - 0.15, 0.03], 0.003);
  for (const [x, y] of [[0.1, -0.08], [0.115, -0.13]]) {
    const knob = cyl(lean, 0.012, 0.014, 0.014, M.alu, [x, 0.3 + y, 0.035], 14);
    knob.rotation.x = Math.PI / 2;
  }
  // Stand: two feet forward, one back, and a yoke under the body.
  rod(bass, [0, 0.1, -0.07], [-0.2, -0.09, 0.14], 0.009, M.steel);
  rod(bass, [0, 0.1, -0.07], [0.2, -0.09, 0.14], 0.009, M.steel);
  rod(bass, [0, 0.1, -0.07], [0, -0.09, -0.24], 0.009, M.steel);
  rod(bass, [-0.11, 0.035, 0.07], [0.11, 0.035, 0.07], 0.011, M.soft);
  rod(bass, [0, 0.1, -0.07], [0, 0.55, -0.13], 0.009, M.steel);
  interactive('music', bass, [1.3, 0.72, 0.06], 1.9);

  // -- right wall: shelf with a trailing plant and the neon bolt; an amp below --
  const side = group(scene, [ROOM.x - 0.12, 1.5, 0.48]);
  box(side, 0.22, 0.03, 0.75, M.bedWood, [0, 0, 0], 0.006);
  const fern = group(side, [0, 0.015, -0.17]);
  cyl(fern, 0.07, 0.05, 0.11, M.clay, [0, 0.055, 0], 20);
  const fr = rng(9);
  for (let i = 0; i < 26; i++) {
    const a = fr() * Math.PI * 2, rad = 0.02 + fr() * 0.1, y = 0.12 + fr() * 0.16 - rad * 0.9;
    mesh(fern, new THREE.IcosahedronGeometry(0.03 + fr() * 0.025, 0), i % 2 ? M.leaf : M.leafDark, [Math.sin(a) * rad, y, Math.cos(a) * rad]).rotation.set(fr() * 3, fr() * 3, 0);
  }
  for (let i = 0; i < 5; i++) mesh(fern, new THREE.IcosahedronGeometry(0.026, 0), M.leaf, [-0.09, 0.02 - i * 0.055, 0.02 + (i % 2) * 0.02]);
  const bolt = new THREE.Shape();
  [[0.035, 0.2], [-0.045, 0.2], [-0.07, 0.085], [-0.02, 0.085], [-0.05, -0.01], [0.06, 0.125], [0.012, 0.125]].forEach(([x, y], i) => (i ? bolt.lineTo(x, y) : bolt.moveTo(x, y)));
  const neonMat = new THREE.MeshStandardMaterial({ color: 0x402408, emissive: 0xffa53d, emissiveIntensity: 3 });
  neonMat.userData.screen = true;
  disposables.push(neonMat);
  const neon = mesh(side, new THREE.ExtrudeGeometry(bolt, { depth: 0.012, bevelEnabled: false }), neonMat, [0.02, 0.04, 0.2], { cast: false, receive: false });
  neon.rotation.y = -Math.PI / 2 + 0.5;
  box(side, 0.07, 0.025, 0.1, M.black, [0.01, 0.027, 0.2], 0.004);
  glow(scene, 0xff9a3a, 0.75, [ROOM.x - 0.16, 1.67, 0.68], 0.42);

  const amp = group(scene, [ROOM.x - 0.28, 0, 1.75], -0.6);
  box(amp, 0.46, 0.5, 0.26, M.black, [0, 0.25, 0], 0.02);
  box(amp, 0.4, 0.33, 0.01, mat(0x23232a, 1), [0, 0.2, 0.131], 0.004, { cast: false });
  box(amp, 0.4, 0.06, 0.012, M.alu, [0, 0.43, 0.131], 0.004, { cast: false });

  // -- pinned to the walls: posters, polaroids, the framed poster by the bed --
  // Paper is lit by the room like everything else, so it dims and warms with the lamp.
  const pin = (parent, tex, w, h, at, rot = [0, 0, 0], frameMat = null) => {
    const g = group(parent, at);
    g.rotation.set(...rot);
    if (frameMat) box(g, w + 0.05, h + 0.05, 0.024, frameMat, [0, 0, 0.012], 0.004);
    mesh(g, new THREE.PlaneGeometry(w, h), mat(0xffffff, 0.7, { map: tex }), [0, 0, frameMat ? 0.0245 : 0.004], { cast: false });
    if (!frameMat) mesh(g, new THREE.PlaneGeometry(w, h), M.black, [0, 0, 0.0025], { receive: false }).rotation.y = Math.PI;
    return g;
  };
  POSTERS.forEach((file, n) => pin(scene, picture(file), 0.2, 0.3, [0.02 + (n % 3) * 0.23, 1.63 - Math.floor(n / 3) * 0.33, 0]));
  const spots = MEMORY_ROWS.flatMap(([x, y, n]) => Array.from({ length: n }, (_, i) => [x + i * POLAROID.step, y + (i % 2) * 0.01]));
  MEMORY_FILES.forEach((file, n) => {
    const tilt = ((((n * 37) % 7) - 3) * Math.PI) / 180;
    if (spots[n]) return pin(scene, picture(file), POLAROID.w, POLAROID.h, [spots[n][0], spots[n][1], 0], [0, 0, tilt]);
    const k = n - spots.length; // the rest go on the right wall, above the bass
    pin(scene, picture(file), POLAROID.w, POLAROID.h, [ROOM.x, 1.7 - Math.floor(k / 2) * 0.175, 1.05 + (k % 2) * 0.16 + (Math.floor(k / 2) % 2) * 0.05], [0, -Math.PI / 2, tilt]);
  });
  // The cluster of polaroids on the back wall: hovering or tapping it moves in close.
  hot.memories = { group: null, mats: [], box: new THREE.Box3(new THREE.Vector3(0.62, 1.14, 0), new THREE.Vector3(1.66, 1.84, 0.01)), h: 0, halo: null };
  pin(scene, picture('/assets/room-poster.webp'), 0.56, 0.86, [-ROOM.x, 1.6, 1.25], [0, Math.PI / 2, 0], M.bedWood);

  // -- lights --
  const hemi = new THREE.HemisphereLight(0x9a9cb8, 0x4a382c, 1);
  scene.add(hemi);
  // The lamp: a cone of light down onto the desk, plus the spill around its shade.
  const spot = new THREE.SpotLight(0xffc98f, 5, 4.5, 1.1, 0.8, 1.5);
  spot.position.copy(BULB);
  spot.target.position.set(BULB.x + 0.55, DESK_Y - 0.1, 0.45);
  spot.castShadow = true;
  spot.shadow.mapSize.setScalar(lite ? 512 : 1024);
  spot.shadow.bias = -0.0015;
  spot.shadow.radius = 5;
  scene.add(spot, spot.target);
  const spill = new THREE.PointLight(0xffb878, 0.9, 3.6, 1.6);
  spill.position.set(BULB.x - 0.02, BULB.y + 0.02, BULB.z - 0.05);
  scene.add(spill);
  // Soft light from above and in front, which is what grounds the furniture with shadows.
  const key = new THREE.DirectionalLight(0xb4bcde, 1.15);
  key.position.set(0.9, 3.4, 3.2);
  key.target.position.set(0, 0.4, 0.6);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(lite ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2.6, bottom: -2.2, near: 0.5, far: 8 });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 9;
  scene.add(key, key.target);
  const neonLight = new THREE.PointLight(0xff9a3a, 0.5, 2.6, 1.8);
  neonLight.position.set(ROOM.x - 0.3, 1.73, 0.68);
  const led = new THREE.PointLight(0xff7a2e, 0.25, 2.2, 1.8);
  led.position.set(-1.27, 1.15, 0.35);
  const screenLight = new THREE.PointLight(0x9fb4ff, 0.1, 1.2, 2);
  screenLight.position.set(0.1, DESK_Y + 0.18, 0.6);
  scene.add(neonLight, led, screenLight);

  // ---- camera and movement -------------------------------------------------

  let destroyed = false, raf = 0, ready = false, lastT = 0, shadowSpin = null;
  // Each value eases toward its goal: az, el turn the camera (drag), mx, my are
  // the mouse's own small turn, z is the zoom, f how far the view has moved in on
  // the point fx, fy, fz, lamp is how bright the lamp is, and spin the chair.
  const cur = { az: 0, el: VIEW.el, mx: 0, my: 0, z: 1, f: 0, fx: 0, fy: 1, fz: 0.2, lamp: 1, spin: 0.12 };
  const goal = { ...cur };
  const fine = { az: 1, el: 1, mx: 1, my: 1, z: 1, f: 1, lamp: 1, spin: 1 };
  let follow = MOVE.ease, focusZoom = MOVE.focus, focusDrift = 0.3, focused = null;
  let glide = glideIn ? 0 : 1, intro = 0, from = null;
  const v = new THREE.Vector3(), target = new THREE.Vector3();

  const layout = () => {
    if (!onLayout) return;
    const rects = {};
    for (const [k, { box: b }] of Object.entries(hot)) {
      let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(cam);
        const x = (v.x + 1) / 2, y = (1 - v.y) / 2;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      rects[k] = { left: `${(x0 * 100).toFixed(2)}%`, top: `${(y0 * 100).toFixed(2)}%`, width: `${((x1 - x0) * 100).toFixed(2)}%`, height: `${((y1 - y0) * 100).toFixed(2)}%` };
    }
    onLayout(rects);
  };

  const draw = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(Math.max(devicePixelRatio || 1, lite ? 1 : 1.25), 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
    }
    // Frame: how much of the room's width shows, and where the camera looks.
    const aspect = w / h, a = VIEW.wide, b = phone ? VIEW.phone : VIEW.wide;
    const tx = a.tx + (b.tx - a.tx) * glide, ty = a.ty + (b.ty - a.ty) * glide;
    const halfW = Math.max(a.halfW + (b.halfW - a.halfW) * glide, VIEW.minHalfH * aspect);
    cam.aspect = aspect;
    cam.fov = (2 * Math.atan(halfW / VIEW.dist / aspect) * 180) / Math.PI;
    cam.updateProjectionMatrix();
    const f = cur.f * focusDrift;
    target.set(tx + (cur.fx - tx) * f, ty + (cur.fy - ty) * f, 0.25 + (cur.fz - 0.25) * f);
    const dist = (VIEW.dist * (1 - focusZoom * cur.f)) / cur.z;
    const az = cur.az + cur.mx, el = cur.el + cur.my;
    cam.position.set(target.x + Math.sin(az) * Math.cos(el) * dist, target.y + Math.sin(el) * dist, target.z + Math.cos(az) * Math.cos(el) * dist);
    cam.position.x = clamp(cam.position.x, -ROOM.x + 0.25, ROOM.x - 0.25);
    cam.position.z = Math.min(cam.position.z, ROOM.front - 0.2);
    cam.lookAt(target);
    cam.updateMatrixWorld();

    // The lamp, and whatever is lit up under the pointer.
    const on = cur.lamp;
    spot.intensity = 5 * on;
    spill.intensity = 0.9 * on;
    bulbMat.emissiveIntensity = 0.05 + 2.15 * on;
    lampGlow.material.opacity = 0.5 * on;
    hemi.intensity = 0.7 + 0.3 * on;
    key.intensity = 0.8 + 0.35 * on;
    seat.rotation.y = cur.spin;
    if (Math.abs(cur.spin - shadowSpin) > 0.0005) {
      shadowSpin = cur.spin;
      renderer.shadowMap.needsUpdate = true;
    }
    for (const k in hot) {
      const o = hot[k];
      if (!o.group) continue;
      for (const [m, base] of o.mats) m.emissive.copy(PINK).multiplyScalar(0.09 * o.h).add(base);
      o.halo.material.opacity = 0.38 * o.h;
    }
    renderer.render(scene, cam);
    layout();
  };

  // Renders only while something is changing, so an idle page costs nothing.
  const tick = (now) => {
    raf = 0;
    if (destroyed || !ready) return;
    const dt = lastT ? Math.min((now - lastT) / (1000 / 60), 4) : 1;
    lastT = now;
    const k = 1 - (1 - follow) ** dt;
    let moving = false;
    for (const key in cur) {
      const d = goal[key] - cur[key];
      if (Math.abs(d) > (fine[key] ? 0.0008 : 0.002)) {
        cur[key] += d * k;
        moving = true;
      } else cur[key] = goal[key];
    }
    for (const key in hot) {
      const o = hot[key], d = (focused === key ? 1 : 0) - o.h;
      if (Math.abs(d) > 0.004) {
        o.h += d * (1 - (1 - 0.14) ** dt);
        moving = true;
      } else o.h = focused === key ? 1 : 0;
    }
    if (intro) {
      const p = (now - intro) / MOVE.introMs;
      glide = p <= 0 ? 0 : p >= 1 ? 1 : easeInOut(p);
      if (p >= 1) intro = 0;
      else moving = true;
    }
    draw();
    if (moving) raf = requestAnimationFrame(tick);
    else lastT = 0;
  };
  const invalidate = () => {
    if (!raf && !destroyed) raf = requestAnimationFrame(tick);
  };

  const onLost = (e) => {
    e.preventDefault();
    if (!destroyed) onFail?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  const ro = new ResizeObserver(invalidate);
  ro.observe(canvas);

  // Up once the first frame has drawn; pictures arrive on the walls as they load.
  requestAnimationFrame(() => {
    if (destroyed) return;
    ready = true;
    draw();
    onReady?.();
    if (glideIn) intro = performance.now() + MOVE.introDelay;
    invalidate();
  });

  return {
    // Mouse position, -1..1 across the window: the camera leans with it and the chair turns.
    setPointer(nx, ny) {
      goal.mx = nx * MOVE.parallax[0];
      goal.my = ny * MOVE.parallax[1];
      goal.spin = 0.12 + nx * 0.22;
      follow = MOVE.ease;
      invalidate();
    },
    // Dragging turns the camera around the room; two fingers pinch to zoom.
    gestureStart() {
      from = { az: goal.az, el: goal.el, z: goal.z };
    },
    gesture(dx, dy, scale) {
      if (!from) return;
      const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1;
      goal.az = clamp(from.az - (dx / W) * 1.5, -VIEW.az, VIEW.az);
      goal.el = clamp(from.el + (dy / H) * 0.9, VIEW.elMin, VIEW.elMax);
      goal.z = clamp(from.z * scale, 0.9, VIEW.zoomMax * 1.08);
      follow = MOVE.drag;
      invalidate();
    },
    // Let go: the view stays where it was turned to. A pinch out past the
    // start springs back.
    gestureEnd() {
      from = null;
      goal.z = goal.z < MOVE.zoomSnap ? 1 : Math.min(goal.z, VIEW.zoomMax);
      follow = MOVE.ease;
      invalidate();
    },
    // Mouse wheel: closer or further.
    zoomBy(factor) {
      goal.z = clamp(goal.z * factor, 1, VIEW.zoomMax);
      follow = MOVE.ease;
      invalidate();
    },
    // Back to the starting view (a double tap or double click).
    reset() {
      from = null;
      goal.az = 0;
      goal.el = VIEW.el;
      goal.z = 1;
      follow = MOVE.ease;
      invalidate();
    },
    // The object under the pointer ('work', 'about', 'music', 'lamp',
    // 'memories'), or null. It lights up and the camera moves in a little; the
    // polaroid wall gets a close look, and `dive` goes right up to the object
    // (as its page opens).
    setFocus(key, dive = false) {
      const o = hot[key];
      focused = o ? key : null;
      if (o) {
        [focusZoom, focusDrift] = dive ? [MOVE.dive, 0.9] : key === 'memories' ? [MOVE.memoriesZoom, 1] : [MOVE.focus, 0.3];
        o.box.getCenter(v);
        if (cur.f < 0.01) Object.assign(cur, { fx: v.x, fy: v.y, fz: v.z });
        Object.assign(goal, { fx: v.x, fy: v.y, fz: v.z });
      }
      goal.f = o ? 1 : 0;
      follow = MOVE.ease;
      invalidate();
    },
    // The desk lamp's switch. Returns whether it is now on.
    toggleLamp() {
      goal.lamp = goal.lamp > 0.5 ? 0 : 1;
      follow = MOVE.ease;
      invalidate();
      return goal.lamp > 0.5;
    },
    // A picture of the room from the starting view (for the still image).
    snapshot() {
      Object.assign(cur, goal, { f: 0, mx: 0, my: 0 });
      draw();
      return canvas.toDataURL('image/webp', 0.86);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
    }
  };
}
