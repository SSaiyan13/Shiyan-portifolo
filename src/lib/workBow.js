// workBow.js — one full-screen WebGL canvas that re-renders [data-bow] images in
// place and bows their planes with scroll velocity. Layout is untouched: the real
// <img> stays in flow (opacity 0 while bowing) and its rect drives the plane every frame.
const CFG = {
  curveK: 0.013,      // sqrt(px/s) -> local units
  maxCurve: 0.06,     // fraction of plane height
  attack: 0.30,       // fast ramp up
  release: 0.06,      // slow ease back to flat
  radius: 14,         // px, matches the Figma corner
  segments: 32
};

const VERT = `
uniform float uVelocity;
varying vec2 vUv;
varying float vWorldY;
void main(){
  vUv = uv;
  vec3 p = position;
  float arch = cos((uv.x - 0.5) * 3.14159265);
  p.y += arch * uVelocity;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorldY = wp.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = `
uniform sampler2D uTex;
uniform vec2 uSize;
uniform float uTexAspect;
uniform float uRadius;
uniform float uClipTop;
uniform float uH;
uniform float uOpacity;
varying vec2 vUv;
varying float vWorldY;
void main(){
  float pa = uSize.x / max(uSize.y, 1.0);
  vec2 uv = vUv;
  if (pa > uTexAspect) { float s = uTexAspect / pa; uv.y = (uv.y - 0.5) * s + 0.5; }
  else { float s = pa / uTexAspect; uv.x = (uv.x - 0.5) * s + 0.5; }
  vec4 c = texture2D(uTex, uv);
  vec2 q = (vUv - 0.5) * uSize;
  vec2 hs = uSize * 0.5 - vec2(uRadius);
  vec2 d = abs(q) - hs;
  float dist = length(max(d, 0.0)) - uRadius;
  float a = 1.0 - smoothstep(-1.0, 1.0, dist);
  float top = uH * 0.5 - vWorldY;
  if (top < uClipTop) a = 0.0;
  gl_FragColor = vec4(c.rgb, c.a * a * uOpacity);
}`;

export function startWorkBow(THREE) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function hasWebgl() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch { return false; }
  }
  if (reduce || !hasWebgl()) return { stop() {} };

  let renderer, scene, camera, canvas, geom, loader;
  let items = [], W = 0, H = 0, raf = 0, tick = 0;
  let lastTop = null, lastT = 0, vel = 0, eased = 0;
  let disposed = false;

  function boot() {
    canvas = document.createElement('canvas');
    canvas.setAttribute('data-bowcanvas', '');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:90;pointer-events:none';
    document.body.appendChild(canvas);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
    geom = new THREE.PlaneGeometry(1, 1, CFG.segments, CFG.segments);
    loader = new THREE.TextureLoader();
    resize();
    addEventListener('resize', resize);
  }

  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    camera.left = -W / 2; camera.right = W / 2;
    camera.top = H / 2; camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
  }

  function sync() {
    const els = document.querySelectorAll('img[data-bow]');
    const seen = [];
    for (const el of els) {
      let it = items.find((i) => i.el === el);
      if (!it) it = add(el);
      seen.push(it);
    }
    for (let k = items.length - 1; k >= 0; k--) {
      if (!seen.includes(items[k])) {
        scene.remove(items[k].mesh);
        items[k].mesh.material.dispose();
        if (items[k].tex) items[k].tex.dispose();
        items[k].el.style.opacity = '';
        items.splice(k, 1);
      }
    }
  }

  function add(el) {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: null },
        uSize: { value: new THREE.Vector2(1, 1) },
        uTexAspect: { value: 1 },
        uRadius: { value: Number(el.getAttribute('data-bow-radius')) || CFG.radius },
        uVelocity: { value: 0 },
        uClipTop: { value: 0 },
        uH: { value: H },
        uOpacity: { value: 1 }
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.frustumCulled = false;
    mesh.visible = false;
    scene.add(mesh);
    const it = { el, mesh, tex: null, ready: false };
    items.push(it);
    const src = el.currentSrc || el.src;
    loader.load(src, (t) => {
      if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      t.needsUpdate = true;
      it.tex = t;
      mat.uniforms.uTex.value = t;
      mat.uniforms.uTexAspect.value = (t.image.width || 1) / (t.image.height || 1);
      it.ready = true;
    });
    return it;
  }

  function identity(el) {
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return true;
    const m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return false;
    const v = m[1].split(',').map(Number);
    return Math.abs(v[0] - 1) < 0.002 && Math.abs(v[3] - 1) < 0.002 &&
           Math.abs(v[4]) < 0.5 && Math.abs(v[5]) < 0.5 &&
           Math.abs(v[1]) < 0.002 && Math.abs(v[2]) < 0.002;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (tick++ % 20 === 0) sync();
    if (!items.length) { renderer.clear(); return; }

    const panel = items[0].el.closest('[data-panel]');
    const live = !!panel && identity(panel);

    const sc = panel ? panel.querySelector('[data-scroller]') : null;
    const top = sc ? sc.scrollTop : (scrollY || 0);
    const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0;
    lastT = now;
    if (lastTop === null) lastTop = top;
    if (dt > 0) vel = (top - lastTop) / dt;
    lastTop = top;
    const sgn = vel < 0 ? -1 : 1;
    let target = sgn * Math.sqrt(Math.abs(vel)) * CFG.curveK;
    target = Math.max(-CFG.maxCurve, Math.min(CFG.maxCurve, target));
    if (!live) target = 0;
    eased += (target - eased) * (Math.abs(target) > Math.abs(eased) ? CFG.attack : CFG.release);
    if (Math.abs(eased) < 0.00005) eased = 0;

    let clipTop = 0;
    if (panel) {
      const hd = panel.querySelector('[data-scroller] > div');
      if (hd) { const hr = hd.getBoundingClientRect(); if (hr.top <= 1) clipTop = hr.bottom; }
    }

    const moving = Math.abs(eased) > 0.0008;

    for (const it of items) {
      const m = it.mesh, u = m.material.uniforms;
      const r = it.el.getBoundingClientRect();
      const on = live && it.ready && r.width > 2 && r.height > 2 && r.bottom > -80 && r.top < H + 80;
      m.visible = on && moving;
      it.el.style.opacity = (on && moving) ? '0' : '';
      if (!m.visible) continue;
      m.scale.set(r.width, r.height, 1);
      m.position.x = r.left + r.width / 2 - W / 2;
      m.position.y = -(r.top + r.height / 2) + H / 2;
      u.uSize.value.set(r.width, r.height);
      u.uVelocity.value = eased;
      u.uClipTop.value = clipTop;
      u.uH.value = H;
    }
    renderer.render(scene, camera);
  }

  boot();
  raf = requestAnimationFrame(frame);

  return {
    stop() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      for (const it of items) {
        it.mesh.material.dispose();
        if (it.tex) it.tex.dispose();
        it.el.style.opacity = '';
      }
      geom?.dispose();
      renderer?.dispose();
      canvas?.remove();
      items = [];
    }
  };
}
