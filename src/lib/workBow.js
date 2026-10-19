// workBow.js — one full-screen WebGL canvas that re-renders [data-bow] images in
// place and bows their planes with scroll velocity. Layout is untouched: the real
// <img> stays in flow (opacity 0 while bowing) and its rect drives the plane every frame.
// The plane is drawn to look exactly like the resting image: same colours, and the
// same CSS saturate/brightness filter if the image has one. An image inside a
// [data-bow-card] has things drawn over it (a gradient, a label); the canvas would
// hide those, so a copy of them is shown above the canvas while the image bows.
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
uniform float uSat;
uniform float uBright;
varying vec2 vUv;
varying float vWorldY;
void main(){
  float pa = uSize.x / max(uSize.y, 1.0);
  vec2 uv = vUv;
  if (pa > uTexAspect) { float s = uTexAspect / pa; uv.y = (uv.y - 0.5) * s + 0.5; }
  else { float s = pa / uTexAspect; uv.x = (uv.x - 0.5) * s + 0.5; }
  vec4 c = texture2D(uTex, uv);
  c.rgb = mix(vec3(dot(c.rgb, vec3(0.2126, 0.7152, 0.0722))), c.rgb, uSat) * uBright;
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

  let renderer, scene, camera, canvas, overlays, geom, loader;
  let items = [], W = 0, H = 0, raf = 0, tick = 0;
  let lastTop = null, lastT = 0, vel = 0, eased = 0;
  let disposed = false;

  function boot() {
    canvas = document.createElement('canvas');
    canvas.setAttribute('data-bowcanvas', '');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:90;pointer-events:none';
    document.body.appendChild(canvas);
    overlays = document.createElement('div');
    overlays.style.cssText = 'position:fixed;inset:0;z-index:91;pointer-events:none;overflow:hidden';
    document.body.appendChild(overlays);
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
    // The canvas covers the whole screen but only ever shows images in motion,
    // where 1.5x is as sharp as the eye can tell and much cheaper than 2x or 3x.
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
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
      else if (it.src !== (el.currentSrc || el.src)) load(it); // the thumbnail fell back to another size
      seen.push(it);
    }
    for (let k = items.length - 1; k >= 0; k--) {
      if (!seen.includes(items[k])) {
        scene.remove(items[k].mesh);
        items[k].mesh.material.dispose();
        if (items[k].tex) items[k].tex.dispose();
        items[k].over?.remove();
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
        uOpacity: { value: 1 },
        uSat: { value: 1 },
        uBright: { value: 1 }
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
    // `on` is whether the plane is showing in place of the image; `w`, `h` the
    // overlay's last size, so it is only resized when that changes.
    const it = { el, mesh, tex: null, ready: false, src: '', card: el.closest('[data-bow-card]'), over: null, on: false, w: 0, h: 0 };
    if (it.card) {
      // Everything in the card except the image itself, to sit above the canvas.
      // Blurs and transitions are left off the copy: they cost a lot to redraw
      // while it moves, and nobody can see them mid-scroll.
      it.over = it.card.cloneNode(true);
      it.over.querySelectorAll('img').forEach((img) => img.remove());
      it.over.querySelectorAll('*').forEach((n) => Object.assign(n.style, { backdropFilter: 'none', webkitBackdropFilter: 'none', transition: 'none' }));
      for (const a of ['data-reveal', 'role', 'tabindex']) it.over.removeAttribute(a);
      it.over.setAttribute('aria-hidden', 'true');
      it.over.inert = true;
      Object.assign(it.over.style, { position: 'absolute', left: 0, top: 0, margin: 0, display: 'none', background: 'none', borderColor: 'transparent', opacity: 1, transform: 'none', transition: 'none', willChange: 'transform' });
      overlays.appendChild(it.over);
    }
    items.push(it);
    load(it);
    return it;
  }

  function load(it) {
    const src = it.el.currentSrc || it.el.src;
    it.src = src;
    loader.load(src, (t) => {
      if (it.src !== src) { t.dispose(); return; }
      // Left untagged so the shader passes the image's own colours straight through.
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      t.needsUpdate = true;
      it.tex?.dispose();
      it.tex = t;
      it.mesh.material.uniforms.uTex.value = t;
      it.mesh.material.uniforms.uTexAspect.value = (t.image.width || 1) / (t.image.height || 1);
      // Upload it to the GPU now, so the first scroll doesn't stall on it.
      renderer.initTexture(t);
      it.ready = true;
    });
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

  // Puts an image back (or takes it away) in place of its plane.
  function show(it, on) {
    if (it.on === on) return;
    it.on = on;
    it.mesh.visible = on;
    it.el.style.opacity = on ? '0' : '';
    if (it.over) it.over.style.display = on ? '' : 'none';
  }

  // While the page is still, a frame only reads the scroll position: no
  // measuring, no drawing. Measuring happens once per frame while it bends, all
  // reads before all writes, so the browser never has to lay the page out twice.
  let bending = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (tick++ % 20 === 0) sync();
    if (!items.length) {
      if (bending) {
        bending = false;
        eased = 0;
        renderer.clear();
      }
      return;
    }

    const panel = items[0].el.closest('[data-panel]');
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
    eased += (target - eased) * (Math.abs(target) > Math.abs(eased) ? CFG.attack : CFG.release);
    if (Math.abs(eased) < 0.00005) eased = 0;
    // Only bend while the panel sits still on screen, not while it animates open or closed.
    if (eased && !(panel && identity(panel))) eased = 0;

    if (Math.abs(eased) <= 0.0008) {
      if (bending) {
        bending = false;
        for (const it of items) show(it, false);
        renderer.clear();
      }
      return;
    }
    if (!bending) {
      // Starting to bend: take each image's current tint once, not every frame.
      bending = true;
      for (const it of items) {
        const filter = getComputedStyle(it.el).filter;
        const u = it.mesh.material.uniforms;
        u.uSat.value = Number(/saturate\(([\d.]+)\)/.exec(filter)?.[1] ?? 1);
        u.uBright.value = Number(/brightness\(([\d.]+)\)/.exec(filter)?.[1] ?? 1);
      }
    }

    // Reads.
    let clipTop = 0;
    const hd = panel ? panel.querySelector('[data-scroller] > div') : null;
    if (hd) { const hr = hd.getBoundingClientRect(); if (hr.top <= 1) clipTop = hr.bottom; }
    const rects = items.map((it) => (it.card || it.el).getBoundingClientRect());

    // Writes.
    overlays.style.clipPath = clipTop ? `inset(${clipTop}px 0 0 0)` : '';
    items.forEach((it, i) => {
      const r = rects[i];
      const on = it.ready && r.width > 2 && r.height > 2 && r.bottom > -80 && r.top < H + 80;
      show(it, on);
      if (!on) return;
      if (it.over) {
        if (it.w !== r.width || it.h !== r.height) {
          it.w = r.width;
          it.h = r.height;
          Object.assign(it.over.style, { width: `${r.width}px`, height: `${r.height}px` });
        }
        it.over.style.transform = `translate3d(${r.left}px,${r.top}px,0)`;
      }
      const m = it.mesh, u = m.material.uniforms;
      m.scale.set(r.width, r.height, 1);
      m.position.x = r.left + r.width / 2 - W / 2;
      m.position.y = -(r.top + r.height / 2) + H / 2;
      u.uSize.value.set(r.width, r.height);
      u.uVelocity.value = eased;
      u.uClipTop.value = clipTop;
      u.uH.value = H;
    });
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
      overlays?.remove();
      items = [];
    }
  };
}
