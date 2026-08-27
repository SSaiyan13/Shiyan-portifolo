// Ambient WebGL gradient — slow-drifting crimson/granite field with ordered dither.
// Cheap on purpose: 0.55 DPR, single fullscreen triangle-pair, paused when not visible.
const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `precision mediump float;
uniform vec2 r;uniform float t;uniform float a;
float h(vec2 v){return fract(sin(dot(v,vec2(12.9898,78.233)))*43758.5453);}
float n(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 v){float s=0.,m=.5;for(int i=0;i<4;i++){s+=m*n(v);v*=2.03;m*=.5;}return s;}
void main(){
 vec2 uv=gl_FragCoord.xy/r.xy;vec2 q=uv;q.x*=r.x/r.y;
 float f=fbm(q*1.5+vec2(t*.018,-t*.012));
 float g=fbm(q*2.6-vec2(t*.011,t*.021));
 vec3 ink=vec3(.043,.051,.047);
 vec3 crim=vec3(.36,.02,.16);
 vec3 gran=vec3(.517,.51,.561);
 vec3 c=ink;
 c=mix(c,crim,smoothstep(.34,.92,f)*.85);
 c=mix(c,gran*.42,smoothstep(.55,1.0,g)*.34);
 float v=1.-length(uv-.5)*.9;
 c*=clamp(v,0.,1.);
 c+=(h(gl_FragCoord.xy)-.5)*.022;
 gl_FragColor=vec4(c,a);
}`;

export function mountAmbient(cv) {
  const gl = cv.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) { cv.style.background = 'radial-gradient(120% 90% at 30% 10%, #3a0119 0%, #0b0d0c 62%)'; return null; }
  const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr); gl.useProgram(pr);
  const bufr = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufr);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uA = gl.getUniformLocation(pr, 'a');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0, t0 = performance.now(), running = false;
  function size() {
    const d = Math.min(window.devicePixelRatio || 1, 1) * 0.55;
    const w = Math.max(2, Math.round(cv.clientWidth * d)), h = Math.max(2, Math.round(cv.clientHeight * d));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(uR, cv.width, cv.height);
  }
  function frame(now) {
    size();
    gl.uniform1f(uT, reduce ? 12 : (now - t0) / 1000);
    gl.uniform1f(uA, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (running && !reduce) raf = requestAnimationFrame(frame);
  }
  const api = {
    start() { if (running) return; running = true; raf = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(raf); },
    once() { raf = requestAnimationFrame(frame); }
  };
  api.once();
  const onResize = () => api.once();
  addEventListener('resize', onResize, { passive: true });
  const onVis = () => (document.hidden ? api.stop() : api.start());
  document.addEventListener('visibilitychange', onVis);
  api.destroy = () => {
    removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVis);
    api.stop();
  };
  return api;
}
