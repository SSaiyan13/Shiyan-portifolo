import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// The 3D hero: Higgsfield's furniture model standing in a room whose walls are
// textured from the original room.png, so the poster, shelf, neon and polaroids
// stay exactly as drawn. Everything is laid out against a reference camera that
// matches the painting's viewpoint.

const IMG_W = 1537, IMG_H = 1023;
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

// Wall regions of room.png. Rows above `clean` are unobstructed wall and are used
// as-is; below that the furniture starts, so the wall colour is carried on down.
const WALLS = {
  back: { x0: 233, x1: 1352, clean: 198 },
  left: { x0: 0, x1: 233, clean: 470 },
  right: { x0: 1352, x1: IMG_W, clean: 345 }
};
const WALL_ROWS = 830;

// Polaroids that sit below the clean part of the right wall (TL, TR, BR, BL in room.png).
const POLAROIDS_PX = [
  [[1455, 302.5], [1481.5, 300], [1482, 370], [1455, 372.5]],
  [[1485.5, 363.5], [1514.5, 361], [1514.5, 435], [1485.5, 437.5]]
];

function wallTexture(img, { x0, x1, clean }) {
  const w = x1 - x0;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = WALL_ROWS;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, x0, 0, w, clean, 0, 0, w, clean);
  // Average the last clean rows into a soft strip and stretch it down the wall.
  const strip = document.createElement('canvas');
  strip.width = Math.max(4, Math.round(w / 28));
  strip.height = 1;
  strip.getContext('2d').drawImage(img, x0, clean - 14, w, 14, 0, 0, strip.width, 1);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(strip, 0, 0, strip.width, 1, 0, clean - 1, w, WALL_ROWS - clean + 1);
  ctx.drawImage(img, x0, clean - 26, w, 26, 0, clean - 26, w, 26);
  const fade = ctx.createLinearGradient(0, clean, 0, WALL_ROWS);
  fade.addColorStop(0, 'rgba(8,8,8,0)');
  fade.addColorStop(1, 'rgba(8,8,8,.5)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, clean, w, WALL_ROWS - clean);
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
  const cam = refCam.clone();
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
    return [(px - x0) / w, 1 - py / rows];
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

  const layout = () => {
    if (!onLayout) return;
    const rects = {};
    for (const [key, b] of Object.entries(HOT_BOXES)) {
      let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
      for (let i = 0; i < 8; i++) {
        v.set(b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]).project(cam);
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
    renderer.render(scene, cam);
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
      add(quad(corners, projected(r.x0, r.x1 - r.x0, WALL_ROWS)), new THREE.MeshBasicMaterial({ map: wallTexture(img, r) }));
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
    onReady?.();
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
