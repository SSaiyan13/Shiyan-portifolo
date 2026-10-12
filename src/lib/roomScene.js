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
function backWallTexture(img) {
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

  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = WALL_PAD + WALL_ROWS;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
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
  return tex;
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

export function mountRoom(canvas, { lite = false, onReady, onLayout, onFail } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: lite ? 'low-power' : 'high-performance' });
  } catch {
    onFail?.();
    return { setPointer() {}, destroy() {} };
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
  let tx = 0, ty = 0, cx = 0, cy = 0;
  // The bass and where the model file put it; `bassMoved` is whether it currently stands by the desk.
  let bass = null, bassMoved = false;
  const bassHome = new THREE.Vector3();

  const layout = () => {
    if (!onLayout) return;
    const rects = {};
    for (const [key, b] of Object.entries(HOT_BOXES)) {
      const move = key === 'music' && bassMoved ? BASS_MOVE : [0, 0, 0];
      let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
      for (let i = 0; i < 8; i++) {
        v.set(b[i & 1 ? 3 : 0] + move[0], b[i & 2 ? 4 : 1] + move[1], b[i & 4 ? 5 : 2] + move[2]).project(cam);
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
    cam.position.set(CAM_POS.x + cx * 0.07, CAM_POS.y + cy * 0.035, CAM_POS.z);
    cam.lookAt(pivot);
    cam.updateMatrixWorld();
    const view = frameFor(w, h, !!bass);
    if (bass && view.moved !== bassMoved) {
      bassMoved = view.moved;
      bass.position.copy(bassHome);
      if (bassMoved) bass.position.add(v.set(...BASS_MOVE));
    }
    viewCam.position.copy(cam.position);
    viewCam.quaternion.copy(cam.quaternion);
    viewCam.setViewOffset(IMG_W, IMG_H, view.x, view.y, view.w, view.h);
    viewCam.updateMatrixWorld();
    renderer.render(scene, viewCam);
    layout();
  };

  // Renders only while something is changing, so an idle page costs nothing.
  const tick = () => {
    raf = 0;
    if (destroyed || !ready) return;
    cx += (tx - cx) * 0.075;
    cy += (ty - cy) * 0.075;
    draw();
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(tick);
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

  Promise.all([loadImage, loadModel]).then(([img, gltf]) => {
    if (destroyed) return;

    const wall = (key, corners) => {
      const r = WALLS[key];
      add(quad(corners, projected(r.x0, r.x1 - r.x0, WALL_ROWS)), new THREE.MeshBasicMaterial({ map: key === 'back' ? backWallTexture(img) : wallTexture(img, r) }));
    };
    wall('back', [[LEFT_X, CEIL_Y, BACK_Z], [RIGHT_X, CEIL_Y, BACK_Z], [RIGHT_X, FLOOR_Y, BACK_Z], [LEFT_X, FLOOR_Y, BACK_Z]]);
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

    scene.add(new THREE.HemisphereLight(LIGHTS.sky, LIGHTS.ground, LIGHTS.ambient));
    for (const [color, intensity, decay, x, y, z] of LIGHTS.points) {
      const light = new THREE.PointLight(color, intensity, 0, decay);
      light.position.set(x, y, z);
      scene.add(light);
    }
    const fill = new THREE.DirectionalLight(LIGHTS.fill[0], LIGHTS.fill[1]);
    fill.position.set(LIGHTS.fill[2], LIGHTS.fill[3], LIGHTS.fill[4]);
    scene.add(fill);

    ready = true;
    draw();
    onReady?.(!!bass);
  }).catch(fail);

  const onLost = (e) => {
    e.preventDefault();
    fail();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  const ro = new ResizeObserver(invalidate);
  ro.observe(canvas);

  return {
    setPointer(nx, ny) {
      tx = nx;
      ty = ny;
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
