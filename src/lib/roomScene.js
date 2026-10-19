import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// The 3D hero: Higgsfield's furniture model standing in a room whose walls are
// textured from the original room.png, so the poster, shelf, neon and polaroids
// stay exactly as drawn. Everything is laid out against a reference camera that
// matches the painting's viewpoint.

export const IMG_W = 1537, IMG_H = 1023;
const FLOOR_Y = -0.277, BACK_Z = -0.38, FRONT_Z = 1.15, CEIL_Y = 0.95;
const CAM_POS = new THREE.Vector3(0, 0.13, 0.92);
const CAM_PITCH = 6 * Math.PI / 180;
const CAM_FOV = 41;

// Clickable objects, as boxes in model space: [minX, minY, minZ, maxX, maxY, maxZ].
const HOT_BOXES = {
  work: [-0.105, -0.015, -0.26, 0.095, 0.14, -0.1],
  about: [0.112, -0.01, -0.185, 0.224, 0.126, -0.14],
  music: [0.325, -0.262, -0.03, 0.46, 0.17, 0.03]
};

// Corners of the framed portrait: on the model (TL, TR, BR, BL) and in room.png.
const PORTRAIT_3D = [[0.121, 0.119, -0.182], [0.217, 0.117, -0.161], [0.216, -0.004, -0.15], [0.119, -0.004, -0.157]];
const PORTRAIT_PX = [[953, 381], [1104, 383], [1093, 573], [941, 564]];

// The laptop lid and the tablet, same idea: corners on the model, corners in room.png.
// Their screens are taken from the painting so the code and the diagram stay sharp.
const SCREENS = [
  {
    at: [[-0.1015, 0.1415, -0.257], [0.0945, 0.1415, -0.2548], [0.0945, 0.0075, -0.2469], [-0.1015, 0.0075, -0.2491]],
    px: [[672, 353.2], [899.2, 353.2], [899.2, 508], [672, 508]]
  },
  {
    at: [[-0.2543, 0.048, -0.0568], [-0.168, 0.048, -0.1431], [-0.1398, -0.012, -0.1149], [-0.226, -0.012, -0.0287]],
    px: [[422.7, 490.7], [571.7, 484], [604, 577.3], [453.3, 596.7]]
  }
];

// Lighting for the furniture, placed where the painting's light sources are.
// Point lights are [colour, intensity, decay, x, y, z]; the fill comes from the camera side.
const LIGHTS = {
  sky: 0x84838c,
  ground: 0x1c1612,
  ambient: 2.4,
  points: [
    [0xffc98a, 0.95, 1, -0.25, 0.19, -0.2], // desk lamp
    [0xffa24a, 0.8, 2, 0.48, 0.42, -0.2], // neon bolt
    [0xff8a3a, 0.12, 1, -0.5, -0.02, -0.36] // LED strip behind the bed
  ],
  fill: [0x9aa6bd, 2.8, 0.5, 0.9, 1.4]
};

// Wall regions of room.png. On the side walls, rows above `clean` are unobstructed
// and are used as-is; below that the wall colour is carried on down. The back wall
// is pieced together in more detail (see BACK_CLEAR).
const WALLS = {
  back: { x0: 233, x1: 1352 },
  left: { x0: 0, x1: 233, clean: 470 },
  right: { x0: 1352, x1: IMG_W, clean: 345 }
};
const WALL_ROWS = 830;
// Rows of plain wall added above the picture, for views taller than the painting.
const WALL_PAD = 420;

// Polaroids that sit below the clean part of the right wall (TL, TR, BR, BL in room.png).
const POLAROIDS_PX = [
  [[1455, 302.5], [1481.5, 300], [1482, 370], [1455, 372.5]],
  [[1485.5, 363.5], [1514.5, 361], [1514.5, 435], [1485.5, 437.5]]
];

// On phones the 3D bass stands beside the desk instead of by the right wall, so
// the view can crop tighter and the three clickable objects get bigger. This is
// how far it moves, in model units (left, and a little forward to clear the desk).
const BASS_MOVE = [-0.122, 0, 0.05];

// The bass is drawn from the painting rather than shown as the 3D model, which
// is too soft at this size: a cut-out of it (from room.png, at this offset and
// size) on a card standing where the bass stands, at depth z.
const BASS_CARD = { src: '/assets/bass-cut.webp', x: 1220, y: 340, w: 270, h: 660, z: 0 };

// Shader pieces that paint room.png onto the furniture (see mountRoom). A
// fragment the painting saw (no nearer furniture in the painting's depth map)
// shows the painting's colour; any other keeps its lit colour, with a short blend.
const PAINT_HEAD = `
uniform sampler2D uPaint;
uniform sampler2D uPaintDepth;
uniform float uPaintNear;
uniform float uPaintFar;
varying vec4 vPaint;
float paintDepth(float d) {
  float z = d * 2.0 - 1.0;
  return 2.0 * uPaintNear * uPaintFar / (uPaintFar + uPaintNear - z * (uPaintFar - uPaintNear));
}
`;
const PAINT_BODY = `
{
  vec3 pn = vPaint.xyz / vPaint.w;
  vec2 puv = pn.xy * 0.5 + 0.5;
  if (vPaint.w > 0.0 && all(greaterThan(puv, vec2(0.001))) && all(lessThan(puv, vec2(0.999)))) {
    float seen = paintDepth(texture2D(uPaintDepth, puv).r);
    float here = paintDepth(pn.z * 0.5 + 0.5);
    float vis = 1.0 - smoothstep(0.004, 0.015, here - seen);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, texture2D(uPaint, puv).rgb, vis);
  }
}
`;

// Posters on the back wall above the desk: two rows of three, all 2:3 and the
// same size. Placed in room.png pixels: the grid's top-left corner, one poster's
// width and the gap between them. `lightRef` is the wall colour a poster shows
// at full brightness; darker wall dims it in proportion.
const POSTERS = {
  files: ['spider-verse', 'dark-knight', 'uncharted', 'haikyuu', 'rooftop', 'leo'].map((n) => `/assets/poster-${n}.webp`),
  // Below where the desktop header ends (about y 188) and over the laptop, whose
  // screen hides the bottom row's last few pixels like a real monitor would.
  x: 676, y: 192, w: 62, gap: 9,
  lightRef: 125
};

// Camera movement. Dragging pans the view across the painting (it can reach the
// painting's edges, and stretches a little past them) and turns the camera a
// little; letting go eases it back. Pinching zooms in around the fingers, and a
// zoomed view stays where it is left until pinched back out or reset. Hovering
// an object on desktop moves the view in toward it. On phones the room first
// shows whole, then glides in to the desk.
const MOVE = {
  stretch: 0.3, // how far a drag follows past the edge
  drag: 0.35, // share of the way to the finger per 60th of a second
  ease: 0.075, // the same for the mouse and for easing back
  focus: 0.07, // how much hovering zooms in
  zoomMax: 2.2, // the painting gets soft past this
  zoomSnap: 1.08, // let go below this and the zoom goes back to none
  introDelay: 250, introMs: 1800
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const stretch = (x, lo, hi) => (x < lo ? lo + (x - lo) * MOVE.stretch : x > hi ? hi + (x - hi) * MOVE.stretch : x);

// The whole room at a phone box's shape: the painting's full width, with wall
// above and floor below. The phone intro starts here.
export function wideFrame(width, height) {
  const h = IMG_W / (width / height);
  return { x: 0, y: 0.56 * IMG_H - h / 2, w: IMG_W, h };
}

// The part of room.png (in its pixels) to show in a box of the given CSS size.
// At the painting's own shape that is the whole picture, and a taller box gains
// wall above and floor below. A phone-width box zooms in instead, so the three
// clickable objects are big enough to tap. With the bass moved (the live 3D
// scene) it shows the lamp head to the bass; with the flat painting, where the
// bass is still by the wall, it shows the lamp to the right edge. Either way the
// bed and poster on the left are dropped, since nothing there is clickable. The
// result can reach past the picture's top and bottom edges, and reports `moved`
// when the bass should stand beside the desk.
const PHONE_CROP = { moved: [0.25, 0.875], flat: [0.235, 1] }; // left and right edges, as shares of the width
export function frameFor(width, height, bassCanMove = false) {
  const aspect = width / height, full = IMG_W / IMG_H;
  if (!(aspect > 0) || aspect >= full - 0.005) return { x: 0, y: 0, w: IMG_W, h: IMG_H, moved: false };
  if (width <= 640) {
    const [left, right] = bassCanMove ? PHONE_CROP.moved : PHONE_CROP.flat;
    const w = (right - left) * IMG_W, h = w / aspect;
    // A tall view sits just under the furniture, so spare height shows wall, not
    // floor; a short one centres on the band the clickable objects are in.
    const y = Math.min(0.95 * IMG_H - h, 0.59 * IMG_H - h / 2);
    return { x: left * IMG_W, y, w, h, moved: bassCanMove };
  }
  const h = IMG_W / aspect;
  // The furniture sits a touch below the picture's middle; follow it as the view grows.
  const cy = (0.5 + 0.015 * Math.min(1, (h - IMG_H) / (0.15 * IMG_H))) * IMG_H;
  return { x: 0, y: cy - h / 2, w: IMG_W, h, moved: false };
}

// How far down room.png each stretch of the back wall is unobstructed, as
// [fromX, toX, rows]: the lamp, laptop, portrait and so on start below these.
const BACK_CLEAR = [
  [233, 305, 480], [305, 480, 195], [480, 660, 335], [660, 910, 340], [910, 1115, 365],
  [1115, 1262, 480], [1262, 1300, 675], [1300, 1352, 345]
];

// The back wall keeps the painting wherever the wall shows in it, including the
// glow around the lamp. Everything the furniture hides is filled in from the
// nearest visible wall in the same row, and the painting's dark top edge is
// evened out so the wall above the furniture reads as lit wall, not black.
function backWallTexture(img, smooth = false) {
  const { x0, x1 } = WALLS.back;
  const w = x1 - x0, CELL = 8, TOP = 150;
  const sw = Math.ceil(w / CELL), sh = Math.ceil(WALL_ROWS / CELL);
  const clearAt = (x) => (BACK_CLEAR.find(([a, b]) => x >= a && x < b) || BACK_CLEAR[BACK_CLEAR.length - 1])[2];

  // A coarse copy of the wall to do the filling on.
  const small = document.createElement('canvas');
  small.width = sw;
  small.height = sh;
  const sctx = small.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(img, x0, 0, w, WALL_ROWS, 0, 0, sw, sh);
  const data = sctx.getImageData(0, 0, sw, sh), px = data.data;
  const at = (i, j) => (j * sw + i) * 4;
  for (let j = 0; j < sh; j++) {
    const known = [];
    for (let i = 0; i < sw; i++) known.push((j + 1) * CELL <= clearAt(x0 + i * CELL + CELL / 2));
    for (let i = 0; i < sw; i++) {
      if (known[i]) continue;
      let l = i - 1, r = i + 1;
      while (l >= 0 && !known[l]) l--;
      while (r < sw && !known[r]) r++;
      for (let c = 0; c < 3; c++) {
        const above = j > 0 ? px[at(i, j - 1) + c] : null;
        let side = null;
        if (l >= 0 && r < sw) side = px[at(l, j) + c] + (px[at(r, j) + c] - px[at(l, j) + c]) * ((i - l) / (r - l));
        else if (l >= 0 || r < sw) side = px[at(l >= 0 ? l : r, j) + c];
        // Mostly carry the wall down from above, easing toward what the sides say.
        px[at(i, j) + c] = above === null ? side : side === null ? above : above * 0.8 + side * 0.2;
      }
    }
  }
  // Pull the dark top rows most of the way toward the lit wall just below them.
  const lit = Math.floor((TOP + 20) / CELL);
  for (let j = 0; j * CELL < TOP; j++) {
    const t = 0.9 * (1 - (j * CELL) / TOP);
    for (let i = 0; i < sw; i++) {
      for (let c = 0; c < 3; c++) px[at(i, j) + c] += (px[at(i, lit) + c] - px[at(i, j) + c]) * t;
    }
  }
  sctx.putImageData(data, 0, 0);

  // The fill shrunk right down and grown back: only the broad light is left (the
  // lamp glow, the darker edges). `light` reads it, to light the posters by.
  const shrink = (src, f) => {
    const c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(src.width / f));
    c.height = Math.max(2, Math.round(src.height / f));
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(src, 0, 0, c.width, c.height);
    return c;
  };
  const tiny = shrink(shrink(small, 3), 3);
  const mid = document.createElement('canvas');
  mid.width = sw;
  mid.height = sh;
  const mctx = mid.getContext('2d', { willReadFrequently: true });
  mctx.imageSmoothingQuality = 'high';
  mctx.drawImage(tiny, 0, 0, sw, sh);
  const glow = mctx.getImageData(0, 0, sw, sh).data;
  // The wall's colour (0-255 RGB) at a point of room.png, smoothly interpolated.
  const light = (x, y) => {
    const fx = clamp((x - x0) / CELL - 0.5, 0, sw - 1), fy = clamp(y / CELL - 0.5, 0, sh - 1);
    const i = Math.min(Math.floor(fx), sw - 2), j = Math.min(Math.floor(fy), sh - 2);
    const u = fx - i, t = fy - j;
    return [0, 1, 2].map((c) => {
      const p = (a, b) => glow[(b * sw + a) * 4 + c];
      return (p(i, j) * (1 - u) + p(i + 1, j) * u) * (1 - t) + (p(i, j + 1) * (1 - u) + p(i + 1, j + 1) * u) * t;
    });
  };

  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = WALL_PAD + WALL_ROWS;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  if (smooth) {
    // Phones see the wall up close, where the pieced-together painting shows its
    // seams. They get the one even wall instead.
    ctx.drawImage(mid, 0, 0, sw, 1, 0, 0, w, WALL_PAD + CELL);
    ctx.drawImage(mid, 0, 0, sw, sh, 0, WALL_PAD, w, WALL_ROWS);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { tex, light };
  }
  ctx.drawImage(small, 0, 0, sw, 1, 0, 0, w, WALL_PAD + CELL); // above the picture: more of the same wall
  ctx.drawImage(small, 0, 0, sw, sh, 0, WALL_PAD, w, WALL_ROWS);
  // The painting itself over the fill wherever the wall is clear, faded in at its top and bottom.
  for (const [a, b, rows] of BACK_CLEAR) {
    const bw = b - a, bh = rows - TOP;
    const part = document.createElement('canvas');
    part.width = bw;
    part.height = bh;
    const pctx = part.getContext('2d');
    pctx.drawImage(img, a, TOP, bw, bh, 0, 0, bw, bh);
    const fade = pctx.createLinearGradient(0, 0, 0, bh);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(Math.min(0.45, 60 / bh), '#000');
    fade.addColorStop(Math.max(0.55, 1 - 30 / bh), '#000');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    pctx.globalCompositeOperation = 'destination-in';
    pctx.fillStyle = fade;
    pctx.fillRect(0, 0, bw, bh);
    ctx.drawImage(part, a - x0, WALL_PAD + TOP);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, light };
}

function wallTexture(img, { x0, x1, clean }) {
  const w = x1 - x0;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = WALL_PAD + WALL_ROWS;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  // Average a few rows into a soft strip that can be stretched along the wall.
  const soft = (row) => {
    const strip = document.createElement('canvas');
    strip.width = Math.max(4, Math.round(w / 28));
    strip.height = 1;
    strip.getContext('2d').drawImage(img, x0, row, w, 14, 0, 0, strip.width, 1);
    return strip;
  };
  const shade = (from, to, alpha) => {
    const fade = ctx.createLinearGradient(0, from, 0, to);
    fade.addColorStop(0, 'rgba(8,8,8,0)');
    fade.addColorStop(1, `rgba(8,8,8,${alpha})`);
    ctx.fillStyle = fade;
    ctx.fillRect(0, Math.min(from, to), w, Math.abs(to - from));
  };
  // Above the picture: the wall carries on up from its top rows.
  const top = soft(0);
  ctx.drawImage(top, 0, 0, top.width, 1, 0, 0, w, WALL_PAD + 1);
  shade(WALL_PAD, 0, 0.35);
  ctx.translate(0, WALL_PAD);
  ctx.drawImage(img, x0, 0, w, clean, 0, 0, w, clean);
  // Below the clean rows: the same, down behind the furniture.
  const low = soft(clean - 14);
  ctx.drawImage(low, 0, 0, low.width, 1, 0, clean - 1, w, WALL_ROWS - clean + 1);
  ctx.drawImage(img, x0, clean - 26, w, 26, 0, clean - 26, w, 26);
  shade(clean, WALL_ROWS, 0.5);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function floorTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#3a2415');
  g.addColorStop(1, '#1c120b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(Math.round((i / 9) * 256), 0, 1, 256);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function mountRoom(canvas, { lite = false, intro: glideIn = false, onReady, onLayout, onFail } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: lite ? 'low-power' : 'high-performance' });
  } catch {
    onFail?.();
    return { setPointer() {}, gestureStart() {}, gesture() {}, gestureEnd() {}, reset() {}, setFocus() {}, destroy() {} };
  }
  // Larger screens are supersampled a little so edges and textures stay smooth on
  // 1x displays; the phone canvas is small and drawn once, so it can be sharp too.
  const minDpr = lite ? 1 : 1.5;
  renderer.setClearColor(0x0b0d0c);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const aspect = IMG_W / IMG_H;
  const refCam = new THREE.PerspectiveCamera(CAM_FOV, aspect, 0.3, 6);
  const target = CAM_POS.clone().add(new THREE.Vector3(0, -Math.tan(CAM_PITCH), -1));
  refCam.position.copy(CAM_POS);
  refCam.lookAt(target);
  refCam.updateMatrixWorld();
  // `cam` sees the whole painting and is what the hotspots are measured against;
  // `viewCam` follows it but renders only the part that fits the canvas's shape.
  const cam = refCam.clone();
  const viewCam = refCam.clone();
  // Parallax orbits around a point inside the room rather than the far target.
  const pivot = CAM_POS.clone().lerp(target, 0.95);

  const v = new THREE.Vector3();
  const toPx = (p) => {
    v.copy(p).project(refCam);
    return [(v.x + 1) / 2 * IMG_W, (1 - v.y) / 2 * IMG_H];
  };
  const fromPx = (px, py) => {
    v.set(px / IMG_W * 2 - 1, 1 - py / IMG_H * 2, 0.5).unproject(refCam);
    return v.sub(CAM_POS).normalize().clone();
  };
  // The side walls stand where the painting's room corners fall on the back wall.
  const cornerX = (px) => {
    const d = fromPx(px, 300);
    return CAM_POS.x + d.x * ((BACK_Z - CAM_POS.z) / d.z);
  };
  const LEFT_X = cornerX(WALLS.left.x1), RIGHT_X = cornerX(WALLS.right.x0);

  // A flat quad between four world corners, with UVs taken from where each vertex
  // lands in room.png as seen from the reference camera.
  const quad = (corners, uvOf, seg = 20) => {
    const [a, b, c, d] = corners.map((p) => new THREE.Vector3(...p));
    const pos = [], uv = [], idx = [];
    const p = new THREE.Vector3(), q = new THREE.Vector3();
    for (let j = 0; j <= seg; j++) {
      for (let i = 0; i <= seg; i++) {
        p.lerpVectors(a, b, i / seg);
        q.lerpVectors(d, c, i / seg);
        p.lerp(q, j / seg);
        pos.push(p.x, p.y, p.z);
        uv.push(...uvOf(p, i / seg, j / seg));
      }
    }
    for (let j = 0; j < seg; j++) {
      for (let i = 0; i < seg; i++) {
        const k = j * (seg + 1) + i;
        idx.push(k, k + seg + 1, k + 1, k + 1, k + seg + 1, k + seg + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return geo;
  };
  const projected = (x0, w, rows) => (p) => {
    const [px, py] = toPx(p);
    return [(px - x0) / w, 1 - (py + WALL_PAD) / (WALL_PAD + rows)];
  };

  const disposables = [];
  const add = (geo, mat) => {
    disposables.push(geo, mat);
    if (mat.map) disposables.push(mat.map);
    mat.side = THREE.DoubleSide;
    // The room is painted, not lit: keep its colours exactly as they are in room.png.
    mat.toneMapped = false;
    const m = new THREE.Mesh(geo, mat);
    scene.add(m);
    return m;
  };

  let destroyed = false, raf = 0, ready = false;
  // Camera state: each value eases toward its goal. `ox`, `oy` turn the camera
  // (mouse or drag), `px`, `py` pan the view in painting pixels (drag), `z` is
  // the pinch zoom, and `f` is the hover zoom toward the point `fx`, `fy`.
  const cur = { ox: 0, oy: 0, px: 0, py: 0, z: 1, f: 0, fx: IMG_W / 2, fy: IMG_H / 2 };
  const goal = { ...cur };
  let follow = MOVE.ease, lastT = 0;
  // Phones: 0 shows the whole room, 1 the desk. `intro` is when the glide in starts.
  let glide = glideIn ? 0 : 1, intro = 0;
  // The view before any gesture or hover, which is what a gesture is measured
  // against; `from` is the zoom and pan the current gesture started at.
  let rest = { x: 0, y: 0, w: IMG_W, h: IMG_H }, from = null;
  // The bass and where the model file put it; `bassT` is how far it has moved toward the desk.
  let bass = null, bassT = 0;
  const bassHome = new THREE.Vector3();

  const layout = () => {
    if (!onLayout) return;
    const rects = {};
    for (const [key, b] of Object.entries(HOT_BOXES)) {
      const t = key === 'music' ? bassT : 0;
      const move = BASS_MOVE.map((d) => d * t);
      let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
      for (let i = 0; i < 8; i++) {
        v.set(b[i & 1 ? 3 : 0] + move[0], b[i & 2 ? 4 : 1] + move[1], b[i & 4 ? 5 : 2] + move[2]).project(viewCam);
        const x = (v.x + 1) / 2, y = (1 - v.y) / 2;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      rects[key] = { left: `${(x0 * 100).toFixed(2)}%`, top: `${(y0 * 100).toFixed(2)}%`, width: `${((x1 - x0) * 100).toFixed(2)}%`, height: `${((y1 - y0) * 100).toFixed(2)}%` };
    }
    onLayout(rects);
  };

  const draw = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(Math.max(devicePixelRatio || 1, minDpr), 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
    }
    cam.position.set(CAM_POS.x + cur.ox * 0.07, CAM_POS.y + cur.oy * 0.035, CAM_POS.z);
    cam.lookAt(pivot);
    cam.updateMatrixWorld();
    const base = frameFor(w, h, !!bass);
    const view = { ...base };
    if (base.moved) {
      // Between the whole room (at this box's shape) and the desk view.
      const wide = wideFrame(w, h);
      for (const k of ['x', 'y', 'w', 'h']) view[k] = wide[k] + (base[k] - wide[k]) * glide;
    }
    rest = { ...view };
    if (cur.f > 0.0005) {
      // Hover: move in a little, and drift toward the object.
      const s = 1 - MOVE.focus * cur.f;
      const mx = view.x + view.w / 2, my = view.y + view.h / 2;
      const nx = mx + (cur.fx - mx) * 0.3 * cur.f, ny = my + (cur.fy - my) * 0.3 * cur.f;
      view.w *= s;
      view.h *= s;
      view.x = nx - view.w / 2;
      view.y = ny - view.h / 2;
    }
    if (cur.z !== 1) {
      const mx = view.x + view.w / 2, my = view.y + view.h / 2;
      view.w /= cur.z;
      view.h /= cur.z;
      view.x = mx - view.w / 2;
      view.y = my - view.h / 2;
    }
    view.x += cur.px;
    view.y += cur.py;
    const t = base.moved ? glide : 0;
    if (bass && t !== bassT) {
      bassT = t;
      bass.position.copy(bassHome).add(v.set(...BASS_MOVE).multiplyScalar(t));
    }
    viewCam.position.copy(cam.position);
    viewCam.quaternion.copy(cam.quaternion);
    viewCam.setViewOffset(IMG_W, IMG_H, view.x, view.y, view.w, view.h);
    viewCam.updateMatrixWorld();
    renderer.render(scene, viewCam);
    layout();
  };

  // Renders only while something is changing, so an idle page costs nothing.
  const tick = (now) => {
    raf = 0;
    if (destroyed || !ready) return;
    // Eased per 60th of a second, so 120 Hz screens move at the same speed.
    const dt = lastT ? Math.min((now - lastT) / (1000 / 60), 4) : 1;
    lastT = now;
    const k = 1 - (1 - follow) ** dt;
    let moving = false;
    for (const key in cur) {
      const d = goal[key] - cur[key];
      if (Math.abs(d) > (key === 'ox' || key === 'oy' || key === 'f' || key === 'z' ? 0.001 : 0.3)) {
        cur[key] += d * k;
        moving = true;
      } else cur[key] = goal[key];
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

  const fail = () => {
    if (destroyed) return;
    onFail?.();
  };

  const loadImage = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = '/assets/room.png';
  });
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const loadModel = loader.loadAsync(lite ? '/assets/room-3d-lite.glb' : '/assets/room-3d.glb');
  // If the cut-out can't load, the 3D bass stays instead.
  const loadBass = new THREE.TextureLoader().loadAsync(BASS_CARD.src).catch(() => null);
  // A poster that can't load is just left off the wall.
  const loadPosters = Promise.all(POSTERS.files.map((f) => new THREE.TextureLoader().loadAsync(f).catch(() => null)));

  Promise.all([loadImage, loadModel, loadBass, loadPosters]).then(([img, gltf, bassTex, posterTexs]) => {
    if (destroyed) return;

    const back = backWallTexture(img, lite);
    const wall = (key, corners) => {
      const r = WALLS[key];
      add(quad(corners, projected(r.x0, r.x1 - r.x0, WALL_ROWS)), new THREE.MeshBasicMaterial({ map: key === 'back' ? back.tex : wallTexture(img, r) }));
    };
    wall('back', [[LEFT_X, CEIL_Y, BACK_Z], [RIGHT_X, CEIL_Y, BACK_Z], [RIGHT_X, FLOOR_Y, BACK_Z], [LEFT_X, FLOOR_Y, BACK_Z]]);

    // Where a point of room.png falls on the plane z, seen from the reference camera.
    const onPlane = (px, py, z) => {
      const d = fromPx(px, py);
      const k = (z - CAM_POS.z) / d.z;
      return [CAM_POS.x + d.x * k, CAM_POS.y + d.y * k, z];
    };

    // The posters, hung just off the back wall. Each is lit by the wall behind it
    // (vertex colours from the wall's own colour), so it dims and warms the way the
    // wall does instead of glowing at full brightness in a dark room.
    const posterZ = BACK_Z + 0.004;
    posterTexs.forEach((tex, n) => {
      if (!tex) return;
      const { x: gx, y: gy, w, gap } = POSTERS;
      const h = w * 1.5;
      const x = gx + (n % 3) * (w + gap), y = gy + Math.floor(n / 3) * (h + gap);
      const geo = quad([onPlane(x, y, posterZ), onPlane(x + w, y, posterZ), onPlane(x + w, y + h, posterZ), onPlane(x, y + h, posterZ)], (p, s, t) => [s, 1 - t], 6);
      const pos = geo.getAttribute('position'), colors = [];
      for (let i = 0; i < pos.count; i++) {
        const [px, py] = toPx(v.fromBufferAttribute(pos, i));
        colors.push(...back.light(px, py).map((c) => clamp(c / POSTERS.lightRef, 0.15, 1.05) ** 2.2));
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const mat = new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, toneMapped: false });
      disposables.push(geo, mat, tex);
      scene.add(new THREE.Mesh(geo, mat));
      // A soft shadow a little below and to the right, where the lamp throws it.
      const sh = 6;
      const shadowGeo = quad([onPlane(x + sh, y + sh, posterZ - 0.002), onPlane(x + w + sh, y + sh, posterZ - 0.002), onPlane(x + w + sh, y + h + sh, posterZ - 0.002), onPlane(x + sh, y + h + sh, posterZ - 0.002)], (p, s, t) => [s, 1 - t], 1);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false });
      disposables.push(shadowGeo, shadowMat);
      scene.add(new THREE.Mesh(shadowGeo, shadowMat));
    });
    wall('left', [[LEFT_X, CEIL_Y, FRONT_Z], [LEFT_X, CEIL_Y, BACK_Z], [LEFT_X, FLOOR_Y, BACK_Z], [LEFT_X, FLOOR_Y, FRONT_Z]]);
    wall('right', [[RIGHT_X, CEIL_Y, BACK_Z], [RIGHT_X, CEIL_Y, FRONT_Z], [RIGHT_X, FLOOR_Y, FRONT_Z], [RIGHT_X, FLOOR_Y, BACK_Z]]);

    const floorTex = floorTexture();
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.repeat.set(3, 1);
    add(
      quad([[LEFT_X, FLOOR_Y, BACK_Z], [RIGHT_X, FLOOR_Y, BACK_Z], [RIGHT_X, FLOOR_Y, FRONT_Z], [LEFT_X, FLOOR_Y, FRONT_Z]], (p, s, t) => [s, 1 - t], 1),
      new THREE.MeshBasicMaterial({ map: floorTex })
    );
    const rugY = FLOOR_Y + 0.002;
    add(
      quad([[-0.3, rugY, -0.2], [0.52, rugY, -0.2], [0.52, rugY, FRONT_Z], [-0.3, rugY, FRONT_Z]], (p, s, t) => [s, 1 - t], 1),
      new THREE.MeshBasicMaterial({ color: 0x1b1b1c })
    );
    add(new THREE.BoxGeometry(RIGHT_X - LEFT_X, 0.03, 0.006).translate((LEFT_X + RIGHT_X) / 2, FLOOR_Y + 0.015, BACK_Z + 0.003), new THREE.MeshBasicMaterial({ color: 0x4d4a47 }));

    // room.png itself, for the pieces that are lifted out of it unchanged.
    const paint = new THREE.Texture(img);
    paint.colorSpace = THREE.SRGBColorSpace;
    paint.anisotropy = 4;
    paint.needsUpdate = true;
    const paintMat = new THREE.MeshBasicMaterial({ map: paint, side: THREE.DoubleSide, toneMapped: false });
    disposables.push(paint, paintMat);
    const paintUV = (corners) => (p, s, t) => {
      const [tl, tr, br, bl] = corners;
      const x = (tl[0] + (tr[0] - tl[0]) * s) * (1 - t) + (bl[0] + (br[0] - bl[0]) * s) * t;
      const y = (tl[1] + (tr[1] - tl[1]) * s) * (1 - t) + (bl[1] + (br[1] - bl[1]) * s) * t;
      return [x / IMG_W, 1 - y / IMG_H];
    };

    for (const px of POLAROIDS_PX) {
      const corners = px.map(([x, y]) => {
        const d = fromPx(x, y);
        const k = (RIGHT_X - 0.003 - CAM_POS.x) / d.x;
        return [CAM_POS.x + d.x * k, CAM_POS.y + d.y * k, CAM_POS.z + d.z * k];
      });
      const geo = quad(corners, paintUV(px), 4);
      disposables.push(geo);
      scene.add(new THREE.Mesh(geo, paintMat));
    }

    // Pieces of the painting laid over the model's own surfaces. The surfaces aren't
    // perfectly flat, so depth is biased to keep the model from poking through.
    const overlay = (corners, px, lift, bias) => {
      const [tl, tr, , bl] = corners.map((p) => new THREE.Vector3(...p));
      const normal = tr.clone().sub(tl).cross(bl.clone().sub(tl)).normalize();
      if (normal.z < 0) normal.negate();
      const mat = paintMat.clone();
      mat.polygonOffset = true;
      mat.polygonOffsetFactor = -2;
      mat.polygonOffsetUnits = bias;
      const geo = quad(corners.map((p) => new THREE.Vector3(...p).addScaledVector(normal, lift).toArray()), paintUV(px), 6);
      disposables.push(geo, mat);
      scene.add(new THREE.Mesh(geo, mat));
    };

    // The hand-drawn portrait covers the model's frame, with a little margin.
    const centre = PORTRAIT_3D.reduce((s, p) => s.add(new THREE.Vector3(...p)), new THREE.Vector3()).multiplyScalar(0.25);
    overlay(PORTRAIT_3D.map((p) => new THREE.Vector3(...p).sub(centre).multiplyScalar(1.13).add(centre).toArray()), PORTRAIT_PX, 0.016, -150000);
    for (const s of SCREENS) overlay(s.at, s.px, 0.003, -20000);

    // The furniture is lit for real, so its surfaces shade smoothly instead of
    // showing the flat texture alone.
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      disposables.push(o.geometry, m);
      for (const tex of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap]) {
        if (!tex) continue;
        tex.anisotropy = aniso;
        disposables.push(tex);
      }
    });
    scene.add(gltf.scene);
    bass = gltf.scene.getObjectByName('bass') || null;
    if (bass) bassHome.copy(bass.position);
    if (bass && bassTex) {
      // The card's corners are where the cut-out's corners fall on the plane
      // z = BASS_CARD.z, as seen from the reference camera, so at rest it lines up
      // with the painting exactly. It moves with the bass, which it replaces.
      const { x, y, w, h, z } = BASS_CARD;
      const geo = quad([onPlane(x, y, z), onPlane(x + w, y, z), onPlane(x + w, y + h, z), onPlane(x, y + h, z)], (p) => {
        const [px, py] = toPx(p);
        return [(px - x) / w, 1 - (py - y) / h];
      }, 8);
      bassTex.colorSpace = THREE.SRGBColorSpace;
      bassTex.anisotropy = aniso;
      const mat = new THREE.MeshBasicMaterial({ map: bassTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
      disposables.push(geo, mat, bassTex);
      const card = new THREE.Mesh(geo, mat);
      card.renderOrder = 1;
      scene.add(card);
      bass.visible = false;
      bass = card;
      bassHome.set(0, 0, 0);
    }

    scene.add(new THREE.HemisphereLight(LIGHTS.sky, LIGHTS.ground, LIGHTS.ambient));
    for (const [color, intensity, decay, x, y, z] of LIGHTS.points) {
      const light = new THREE.PointLight(color, intensity, 0, decay);
      light.position.set(x, y, z);
      scene.add(light);
    }
    const fill = new THREE.DirectionalLight(LIGHTS.fill[0], LIGHTS.fill[1]);
    fill.position.set(LIGHTS.fill[2], LIGHTS.fill[3], LIGHTS.fill[4]);
    scene.add(fill);

    // The furniture shows the drawing itself wherever the painting saw it: room.png
    // is projected onto it from the painting's viewpoint, so at rest the desk, lamp,
    // books, plants, drawers, chair and bed look exactly as drawn. Surfaces the
    // painting never showed (sides that turn into view on a drag, parts behind the
    // chair) keep the model's own lit texture. Which surfaces the painting saw is
    // worked out once, from a depth render of the furniture alone from that viewpoint.
    const dw = lite ? 1024 : 2048, dh = Math.round(dw / aspect);
    const depthRT = new THREE.WebGLRenderTarget(dw, dh, { depthTexture: new THREE.DepthTexture(dw, dh) });
    const depthOnly = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, colorWrite: false });
    disposables.push(depthRT, depthOnly);
    const others = scene.children.filter((o) => o !== gltf.scene && o.visible);
    others.forEach((o) => (o.visible = false));
    scene.overrideMaterial = depthOnly;
    renderer.setRenderTarget(depthRT);
    renderer.render(scene, refCam);
    renderer.setRenderTarget(null);
    scene.overrideMaterial = null;
    others.forEach((o) => (o.visible = true));
    // room.png as stored (no colour decoding), since it's written out as is.
    const raw = new THREE.Texture(img);
    raw.anisotropy = 4;
    raw.needsUpdate = true;
    disposables.push(raw);
    const painted = {
      uPaint: { value: raw },
      uPaintDepth: { value: depthRT.depthTexture },
      uPaintMat: { value: new THREE.Matrix4().multiplyMatrices(refCam.projectionMatrix, refCam.matrixWorldInverse) },
      uPaintNear: { value: refCam.near },
      uPaintFar: { value: refCam.far }
    };
    gltf.scene.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      o.material.onBeforeCompile = (s) => {
        Object.assign(s.uniforms, painted);
        s.vertexShader = 'uniform mat4 uPaintMat;\nvarying vec4 vPaint;\n' +
          s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vPaint = uPaintMat * modelMatrix * vec4(transformed, 1.0);');
        s.fragmentShader = PAINT_HEAD + s.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + PAINT_BODY);
      };
      o.material.customProgramCacheKey = () => 'painted';
      o.material.needsUpdate = true;
    });

    ready = true;
    draw();
    onReady?.(!!bass);
    if (glideIn) {
      intro = performance.now() + MOVE.introDelay;
      invalidate();
    }
  }).catch(fail);

  const onLost = (e) => {
    e.preventDefault();
    fail();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  const ro = new ResizeObserver(invalidate);
  ro.observe(canvas);

  return {
    // Mouse position, -1..1 across the window.
    setPointer(nx, ny) {
      goal.ox = nx;
      goal.oy = ny;
      follow = MOVE.ease;
      invalidate();
    },
    // Touch gestures. A gesture starts (again) whenever a finger lands or lifts.
    gestureStart() {
      from = { z: goal.z, px: goal.px, py: goal.py };
    },
    // The fingers' centre has moved dx, dy CSS pixels from where it was at
    // (sx, sy) in the canvas, and their spread has grown `scale` times. The point
    // of the painting that was under the fingers stays under them.
    gesture(dx, dy, scale, sx, sy) {
      if (!from) return;
      const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1;
      const z0 = from.z * scale;
      const z = z0 < 1 ? 1 - (1 - z0) * MOVE.stretch : z0 > MOVE.zoomMax ? MOVE.zoomMax + (z0 - MOVE.zoomMax) * MOVE.stretch : z0;
      // The view at a zoom and pan, without the pan: centred on the resting view.
      const frame = (zz) => ({ w: rest.w / zz, h: rest.h / zz, x: rest.x + (rest.w - rest.w / zz) / 2, y: rest.y + (rest.h - rest.h / zz) / 2 });
      const a = frame(from.z), b = frame(z);
      const px = a.x + from.px + (sx / W) * a.w, py = a.y + from.py + (sy / H) * a.h;
      // It may show anything within the painting or the resting view, and
      // follows a little way past that.
      const x = stretch(px - ((sx + dx) / W) * b.w, Math.min(rest.x, 0), Math.max(rest.x + rest.w, IMG_W) - b.w);
      const y = stretch(py - ((sy + dy) / H) * b.h, Math.min(rest.y, 0), Math.max(rest.y + rest.h, IMG_H) - b.h);
      goal.z = z;
      goal.px = x - b.x;
      goal.py = y - b.y;
      goal.ox = clamp((-dx / W) * 2.4, -1.4, 1.4);
      goal.oy = clamp((dy / H) * 2.4, -1, 1);
      follow = MOVE.drag;
      invalidate();
    },
    // All fingers lifted. Unzoomed, everything eases back to rest; zoomed in, the
    // view stays put, pulled back inside its edges.
    gestureEnd() {
      from = null;
      goal.ox = goal.oy = 0;
      follow = MOVE.ease;
      if (goal.z < MOVE.zoomSnap) {
        goal.z = 1;
        goal.px = goal.py = 0;
      } else {
        goal.z = Math.min(goal.z, MOVE.zoomMax);
        const w = rest.w / goal.z, h = rest.h / goal.z;
        const bx = rest.x + (rest.w - w) / 2, by = rest.y + (rest.h - h) / 2;
        goal.px = clamp(bx + goal.px, Math.min(rest.x, 0), Math.max(rest.x + rest.w, IMG_W) - w) - bx;
        goal.py = clamp(by + goal.py, Math.min(rest.y, 0), Math.max(rest.y + rest.h, IMG_H) - h) - by;
      }
      invalidate();
    },
    // Back to the resting view (a double tap).
    reset() {
      from = null;
      goal.z = 1;
      goal.px = goal.py = goal.ox = goal.oy = 0;
      follow = MOVE.ease;
      invalidate();
    },
    // The object being hovered ('work', 'about', 'music'), or null.
    setFocus(key) {
      const b = HOT_BOXES[key];
      if (b) {
        const t = key === 'music' ? bassT : 0;
        const [x, y] = toPx(v.set((b[0] + b[3]) / 2 + BASS_MOVE[0] * t, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2 + BASS_MOVE[2] * t));
        if (cur.f < 0.01) {
          cur.fx = x;
          cur.fy = y;
        }
        goal.fx = x;
        goal.fy = y;
      }
      goal.f = b ? 1 : 0;
      follow = MOVE.ease;
      invalidate();
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
