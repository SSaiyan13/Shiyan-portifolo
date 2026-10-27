import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { IMG_W, IMG_H, frameFor, wideFrame, mountRoom } from '../lib/roomScene.js';

const frameStyle = { position: 'absolute', left: 0, top: 0, width: '100%', aspectRatio: `${IMG_W}/${IMG_H}`, transition: 'opacity .9s ease' };

const hotspots = [
  {
    key: 'work',
    label: 'Technical Projects',
    ariaLabel: 'Open technical projects',
    rect: { left: '42.5%', top: '33.9%', width: '17.2%', height: '19.4%' },
    ringRadius: 5,
    plate: 'up'
  },
  {
    key: 'music',
    label: 'Music Tech Projects',
    ariaLabel: 'Open music tech projects',
    rect: { left: '83.4%', top: '34.1%', width: '10.9%', height: '58.4%' },
    ringRadius: 120,
    plate: 'side'
  },
  {
    key: 'about',
    label: 'About Me',
    ariaLabel: 'Open about',
    rect: { left: '60.6%', top: '36.7%', width: '11.7%', height: '19.8%' },
    ringRadius: 4,
    plate: 'down'
  },
  {
    key: 'memories',
    label: 'Memories',
    ariaLabel: 'Look closer at the polaroid wall',
    rect: { left: '58.9%', top: '20.7%', width: '27.7%', height: '17.8%' },
    ringRadius: 6,
    plate: 'up'
  }
];

const plateStyle = {
  up: { left: '50%', bottom: 'calc(100% + 20px)', transform: 'translate3d(-50%,10px,0)', textAlign: 'center' },
  side: { right: 6, bottom: 'calc(100% + 14px)', transform: 'translate3d(0,10px,0)', textAlign: 'right' },
  down: { left: '50%', top: 'calc(100% + 18px)', transform: 'translate3d(-50%,-10px,0)', textAlign: 'center' }
};

const Hero = forwardRef(function Hero({ onOpen }, ref) {
  const roomRef = useRef(null);
  const frameRefs = useRef([]);
  const canvasRef = useRef(null);
  const hotRefs = useRef([]);
  const asideRef = useRef(null);
  // Whether the 3D scene is showing with its bass moved beside the desk (phones);
  // the framing differs from the flat painting's, where the bass can't move.
  const bassMovesRef = useRef(false);
  // While the 3D room is up, it places the hotspots itself, relative to the room box.
  const liveRef = useRef(false);
  const sceneRef = useRef(null);
  // Whether a tap has the camera close on the polaroid wall.
  const memoriesRef = useRef(false);
  const introRef = useRef(false);
  const fitRef = useRef(() => {});

  // Keep the painting framed for the room box's current shape (see frameFor).
  useLayoutEffect(() => {
    const room = roomRef.current;
    const fit = () => {
      const w = room.clientWidth, h = room.clientHeight;
      if (!w || !h) return;
      const r = introRef.current ? wideFrame(w, h) : frameFor(w, h, bassMovesRef.current);
      const style = { width: `${(IMG_W / r.w) * 100}%`, left: `${(-r.x / r.w) * 100}%`, top: `${(-r.y / r.h) * 100}%`, height: '', aspectRatio: `${IMG_W}/${IMG_H}` };
      frameRefs.current.forEach((el, i) => {
        if (!el) return;
        Object.assign(el.style, i === 1 && liveRef.current ? { width: '100%', height: '100%', left: 0, top: 0, aspectRatio: 'auto' } : style);
      });
    };
    fitRef.current = fit;
    // Phones open on the whole room and glide in once the 3D room is up, so the
    // picture shown while it loads is framed the same way.
    introRef.current = room.clientWidth <= 640 && !navigator.connection?.saveData && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    fit();
    // The room opens straight onto the 3D scene: the flat picture (and its
    // hotspots) stay hidden while it loads, and only come in if it can't run.
    if (!navigator.connection?.saveData) {
      frameRefs.current.forEach((el) => el && Object.assign(el.style, { transition: 'none', opacity: 0 }));
    }
    const ro = new ResizeObserver(fit);
    ro.observe(room);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    hotRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.35 + i * 0.12, ease: 'sine.out' });
    });
    if (asideRef.current) {
      gsap.fromTo(
        Array.from(asideRef.current.children),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, delay: 0.25, ease: 'power3.out' }
      );
    }

    const room = roomRef.current;
    const canvas = canvasRef.current;
    if (!room || !canvas) return;

    // Phones, tablets and low-memory devices get the small model. With a mouse the
    // camera follows the pointer; on touch screens dragging the room looks around.
    // A narrow desktop window is still a desktop, so it keeps the full model.
    const touch = matchMedia('(pointer: coarse)').matches;
    const shortSide = Math.min(screen.width, screen.height);
    const lite = touch || (shortSide > 0 && shortSide <= 820) || (navigator.deviceMemory || 8) <= 4;
    const follow = !reduce && !touch;

    const [imageFrame, hotFrame] = frameRefs.current;
    const reveal = (el) => Object.assign(el.style, { transition: 'opacity .9s ease', opacity: '' });
    // On a very slow connection, the picture comes in rather than leaving an empty room.
    const slow = setTimeout(() => {
      reveal(imageFrame);
      reveal(hotFrame);
    }, 8000);

    // Until the 3D room is up (or if it can't run), the flat image drifts instead.
    let live = false, scene = null;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      if (live) {
        scene.setPointer(nx * 2, ny * -2);
        return;
      }
      tx = nx * -26;
      ty = ny * -16;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      room.style.transform = `translate3d(calc(-50% + ${cx.toFixed(2)}px), calc(-50% + ${cy.toFixed(2)}px), 0) scale(1.03)`;
      raf = !live && (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(tick) : 0;
    };
    const flat = () => {
      live = liveRef.current = false;
      bassMovesRef.current = false;
      sceneRef.current = null;
      room.style.touchAction = '';
      introRef.current = false;
      fitRef.current();
      canvas.style.opacity = 0;
      clearTimeout(slow);
      reveal(imageFrame);
      reveal(hotFrame);
      hotspots.forEach((h, i) => hotRefs.current[i] && Object.assign(hotRefs.current[i].style, h.rect));
    };

    // Touch: one finger drags to look around, two fingers pinch to zoom (and drag
    // while zoomed). A double tap goes back to the start. A gesture that ends on
    // a lit object doesn't count as a tap on it.
    const pts = new Map();
    let gest = null, dragged = false, lastTap = null;
    const centre = () => {
      const [a, b] = pts.values();
      return b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) } : { x: a.x, y: a.y, d: 0 };
    };
    // (Re)starts the gesture from where things are now, when a finger lands or lifts.
    const begin = () => {
      const c = centre(), r = canvas.getBoundingClientRect();
      gest = { ...c, ox: c.x - r.left, oy: c.y - r.top, on: gest?.on || false };
      scene.gestureStart();
    };
    const onDown = (e) => {
      if (!live || e.pointerType === 'mouse' || pts.size >= 2) return;
      if (!pts.size) dragged = false;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      begin();
    };
    const onDrag = (e) => {
      const p = pts.get(e.pointerId);
      if (!p || !gest) return;
      p.x = e.clientX;
      p.y = e.clientY;
      const c = centre();
      const dx = c.x - gest.x, dy = c.y - gest.y, scale = gest.d && c.d ? c.d / gest.d : 1;
      if (!gest.on && Math.hypot(dx, dy) < 8 && Math.abs(scale - 1) < 0.04) return;
      gest.on = dragged = true;
      scene.gesture(dx, dy, scale, gest.ox, gest.oy);
    };
    const onUp = (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      pts.delete(e.pointerId);
      if (pts.size) {
        begin();
        return;
      }
      if (gest?.on) scene.gestureEnd();
      else {
        const now = performance.now();
        if (lastTap && now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) {
          scene.reset();
          lastTap = null;
        } else lastTap = { t: now, x: p.x, y: p.y };
      }
      gest = null;
    };
    // iOS Safari zooms the whole page on a pinch unless told not to.
    const noPageZoom = (e) => live && e.preventDefault();
    const onClick = (e) => {
      if (!dragged) return;
      dragged = false;
      e.stopPropagation();
      e.preventDefault();
    };

    if (!navigator.connection?.saveData) {
      scene = mountRoom(canvas, {
        lite,
        onReady: (bassCanMove) => {
          live = liveRef.current = true;
          sceneRef.current = scene;
          bassMovesRef.current = bassCanMove;
          fitRef.current();
          cancelAnimationFrame(raf);
          raf = 0;
          room.style.transform = 'translate3d(-50%,-50%,0)';
          room.style.touchAction = 'none';
          canvas.style.opacity = 1;
          clearTimeout(slow);
          reveal(hotFrame);
        },
        onLayout: (rects) => hotspots.forEach((h, i) => hotRefs.current[i] && Object.assign(hotRefs.current[i].style, rects[h.key])),
        onFail: flat,
        // The 3D room fades in over the picture at the same framing, then glides in.
        intro: introRef.current
      });
      if (introRef.current) canvas.style.transition = 'opacity .45s ease';
    } else {
      clearTimeout(slow);
      reveal(imageFrame);
      reveal(hotFrame);
    }
    if (follow) addEventListener('pointermove', onMove, { passive: true });
    room.addEventListener('pointerdown', onDown);
    room.addEventListener('gesturestart', noPageZoom);
    addEventListener('pointermove', onDrag, { passive: true });
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
    room.addEventListener('click', onClick, true);
    return () => {
      removeEventListener('pointermove', onMove);
      room.removeEventListener('pointerdown', onDown);
      removeEventListener('pointermove', onDrag);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onUp);
      room.removeEventListener('click', onClick, true);
      room.removeEventListener('gesturestart', noPageZoom);
      clearTimeout(slow);
      cancelAnimationFrame(raf);
      sceneRef.current = null;
      scene?.destroy();
    };
  }, []);

  return (
    <section ref={ref} data-stage="" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        ref={roomRef}
        data-room=""
        style={{
          // The full width of the room, so the bass by the right wall shows whole.
          position: 'absolute', top: '50%', left: '50%', transform: 'translate3d(-50%,-50%,0)',
          width: '100vw', aspectRatio: `${IMG_W}/${IMG_H}`, willChange: 'transform', overflow: 'hidden',
          userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none'
        }}
      >
        {/* The two frames are the whole painting, placed so the part chosen for this
            box's shape fills it: one holds the flat image, the other the hotspots. */}
        <div ref={(el) => (frameRefs.current[0] = el)} style={frameStyle}>
          <img
            src="/assets/room.png"
            alt="A dark bedroom studio: desk with laptop, iPad, framed portrait, and a bass guitar."
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.82) contrast(1.04) brightness(.96)' }}
          />
        </div>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, transition: 'opacity .9s ease', filter: 'saturate(.82) contrast(1.04) brightness(.96)' }}
        />
        <div data-vignette="round" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(78% 62% at 52% 48%,rgba(11,13,12,0) 34%,rgba(11,13,12,.62) 100%)', pointerEvents: 'none' }} />
        <div data-vignette="ends" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(11,13,12,.78) 0%,rgba(11,13,12,0) 26%,rgba(11,13,12,0) 62%,rgba(11,13,12,.86) 100%)', pointerEvents: 'none' }} />

        <div ref={(el) => (frameRefs.current[1] = el)} style={{ ...frameStyle, pointerEvents: 'none' }}>
          {hotspots.map((h, i) => (
            <button
              key={h.key}
              ref={(el) => (hotRefs.current[i] = el)}
              data-hot=""
              aria-label={h.ariaLabel}
              onClick={(e) => {
                if (h.key !== 'memories') return onOpen(h.key, e);
                // The polaroid wall opens nothing: a tap toggles the close look (hover does it with a mouse).
                memoriesRef.current = !memoriesRef.current;
                sceneRef.current?.setFocus(memoriesRef.current ? 'memories' : null);
              }}
              onPointerEnter={(e) => e.pointerType === 'mouse' && sceneRef.current?.setFocus(h.key)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && sceneRef.current?.setFocus(null)}
              onFocus={() => sceneRef.current?.setFocus(h.key)}
              onBlur={() => {
                memoriesRef.current = false;
                sceneRef.current?.setFocus(null);
              }}
              style={{ position: 'absolute', ...h.rect, cursor: 'pointer', background: 'none', border: 0, pointerEvents: 'auto' }}
            >
              <span
                data-ring=""
                style={{
                  position: 'absolute', inset: -3, borderRadius: h.ringRadius, opacity: 0.42,
                  boxShadow: '0 0 0 1px rgba(224,166,190,.2),0 0 26px 4px rgba(142,6,64,.26)',
                  transition: 'box-shadow .45s cubic-bezier(.22,1,.36,1),opacity .45s'
                }}
              />
              <span
                data-plate={h.plate}
                style={{
                  position: 'absolute', width: 'max-content', maxWidth: 230, opacity: 0, pointerEvents: 'none',
                  transition: 'opacity .4s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)',
                  ...plateStyle[h.plate]
                }}
              >
                <span style={{ display: 'block', fontFamily: "'Bodoni Moda',serif", fontSize: 30, lineHeight: 1, letterSpacing: '-.02em', color: '#F7F0F0' }}>
                  {h.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={asideRef}
        data-heroaside=""
        style={{
          position: 'absolute', left: 'clamp(18px,3.2vw,44px)', bottom: 40, zIndex: 20,
          display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 'min(330px,38vw)', pointerEvents: 'none'
        }}
      >
        <p data-herotitle="" style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(21px,1.9vw,29px)', lineHeight: 1.22, letterSpacing: '-.015em', color: '#F7F0F0', textWrap: 'pretty' }}>
          Aspiring product manager building at the seam of <em style={{ fontStyle: 'italic', color: '#E0A6BE' }}>sound</em> and software.
        </p>
        <span
          data-hint=""
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start',
            fontSize: 13, fontWeight: 600, letterSpacing: '.09em', color: '#F7F0F0',
            textShadow: '0 0 16px rgba(224,166,190,.6), 0 0 2px rgba(11,13,12,.9)'
          }}
        >
          <span
            data-hintdot=""
            aria-hidden="true"
            style={{ flex: 'none', width: 8, height: 8, borderRadius: '50%', background: '#E0A6BE', boxShadow: '0 0 0 1px rgba(224,166,190,.5), 0 0 14px 3px rgba(142,6,64,.8)' }}
          />
          <span data-hint-hover="">Hover a lit object. Click to enter.</span>
          <span data-hint-touch="">Drag to look around, pinch to zoom. Tap a lit object to enter.</span>
        </span>
      </div>

      <div
        data-mobileindex=""
        style={{ display: 'none', gridTemplateColumns: '1fr', gap: 1, background: 'rgba(247,240,240,.1)', borderTop: '1px solid rgba(247,240,240,.1)', borderBottom: '1px solid rgba(247,240,240,.1)' }}
      >
        {[
          { key: 'work', label: 'Technical Projects', n: '01' },
          { key: 'music', label: 'Music Tech Projects', n: '02' },
          { key: 'about', label: 'About Me', n: '03' }
        ].map((it) => (
          <button
            key={it.key}
            data-indexbtn=""
            onClick={(e) => onOpen(it.key, e)}
            style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '20px 18px', background: '#0B0D0C', textAlign: 'left', minHeight: 64 }}
          >
            <span data-indexlabel="" style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 26, letterSpacing: '-.02em' }}>{it.label}</span>
            <span style={{ fontSize: 9.5, letterSpacing: '.24em', textTransform: 'uppercase', color: '#84828F' }}>{it.n}</span>
          </button>
        ))}
      </div>
    </section>
  );
});

export default Hero;
