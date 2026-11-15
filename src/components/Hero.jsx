import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { IMG_W, IMG_H, mountRoom } from '../lib/roomScene.js';

// Where the clickable things sit in the still picture (room-still.webp), which is
// shown when the 3D room can't run. The lamp is only a switch in the live room.
const STILL = {
  work: { left: '44.86%', top: '41.1%', width: '15.08%', height: '16.97%' },
  music: { left: '78.5%', top: '27.66%', width: '15.5%', height: '61.97%' },
  about: { left: '61.88%', top: '36.68%', width: '11.52%', height: '19.31%' },
  memories: { left: '65.25%', top: '10.97%', width: '27.92%', height: '25.2%' },
  lamp: { display: 'none' }
};


// The clickable things. The live room places them itself, wherever the camera is.
const hotspots = [
  { key: 'work', label: 'Technical Projects', ariaLabel: 'Open technical projects', rect: STILL.work, plate: 'up' },
  { key: 'music', label: 'Music Tech Projects', ariaLabel: 'Open music tech projects', rect: STILL.music, plate: 'side' },
  { key: 'about', label: 'About Me', ariaLabel: 'Open about', rect: STILL.about, plate: 'down' },
  { key: 'memories', label: 'Memories', ariaLabel: 'Look closer at the polaroid wall', rect: STILL.memories, plate: 'up' },
  { key: 'lamp', label: 'Lamp', ariaLabel: 'Switch the desk lamp', rect: STILL.lamp, plate: 'up', small: true }
];

const plateStyle = {
  up: { left: '50%', bottom: 'calc(100% + 16px)', transform: 'translate3d(-50%,10px,0)', textAlign: 'center' },
  side: { right: 6, bottom: 'calc(100% + 14px)', transform: 'translate3d(0,10px,0)', textAlign: 'right' },
  down: { left: '50%', top: 'calc(100% + 16px)', transform: 'translate3d(-50%,-10px,0)', textAlign: 'center' }
};

const inRect = (e, r) => e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;

const Hero = forwardRef(function Hero({ onOpen, open }, ref) {
  const roomRef = useRef(null);
  const stillRef = useRef(null);
  const hotFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const hotRefs = useRef([]);
  const asideRef = useRef(null);
  // While the 3D room is up, it places the hotspots itself, across the whole room box.
  const liveRef = useRef(false);
  const sceneRef = useRef(null);
  // Whether a tap has the camera close on the polaroid wall.
  const memoriesRef = useRef(false);
  // The hotspot the mouse has focused, and where it was on screen before the zoom.
  const heldRef = useRef(null);
  const [lampOn, setLampOn] = useState(true);
  useEffect(() => {
    const onMove = (e) => {
      const held = heldRef.current;
      if (e.pointerType !== 'mouse' || !held || held.el.contains(e.target) || inRect(e, held.rect)) return;
      heldRef.current = null;
      sceneRef.current?.setFocus(null);
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, []);
  // Opening a page moves the camera right up to its object; closing it steps back.
  useEffect(() => {
    if (!open) {
      heldRef.current = null;
      sceneRef.current?.setFocus(null);
    }
  }, [open]);
  const fitRef = useRef(() => {});

  // The still picture covers the room box, centred, and its hotspots go with it.
  useLayoutEffect(() => {
    const room = roomRef.current;
    const fit = () => {
      const w = room.clientWidth, h = room.clientHeight;
      if (!w || !h) return;
      const fw = Math.max(w, (h * IMG_W) / IMG_H), fh = (fw * IMG_H) / IMG_W;
      const cover = { width: `${fw}px`, height: `${fh}px`, left: `${(w - fw) / 2}px`, top: `${(h - fh) / 2}px` };
      Object.assign(stillRef.current.style, cover);
      Object.assign(hotFrameRef.current.style, liveRef.current ? { width: '100%', height: '100%', left: 0, top: 0 } : cover);
    };
    fitRef.current = fit;
    fit();
    // The room opens straight onto the 3D scene: the still picture (and its
    // hotspots) stay hidden while it starts, and only come in if it can't run.
    if (!navigator.connection?.saveData) {
      [stillRef.current, hotFrameRef.current].forEach((el) => Object.assign(el.style, { transition: 'none', opacity: 0 }));
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

    // Phones, tablets and low-memory devices get lighter shadows. With a mouse the
    // camera leans with the pointer; dragging (mouse or finger) turns it around the room.
    const touch = matchMedia('(pointer: coarse)').matches;
    const shortSide = Math.min(screen.width, screen.height);
    const lite = touch || (shortSide > 0 && shortSide <= 820) || (navigator.deviceMemory || 8) <= 4;
    const phone = room.clientWidth <= 640;
    const follow = !reduce && !touch;

    const still = stillRef.current, hotFrame = hotFrameRef.current;
    const reveal = (el) => Object.assign(el.style, { transition: 'opacity .9s ease', opacity: '' });

    let live = false, scene = null;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse' || !live || pts.size) return;
      scene.setPointer((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * -2);
    };
    const flat = () => {
      live = liveRef.current = false;
      sceneRef.current = null;
      room.style.touchAction = '';
      room.style.cursor = '';
      fitRef.current();
      canvas.style.opacity = 0;
      reveal(still);
      reveal(hotFrame);
      hotspots.forEach((h, i) => hotRefs.current[i] && Object.assign(hotRefs.current[i].style, h.rect));
    };

    // Dragging turns the camera, with a mouse or one finger; two fingers pinch to
    // zoom. A double tap (or double click) goes back to the start. A drag that
    // ends on a lit object doesn't count as a click on it.
    const pts = new Map();
    let gest = null, dragged = false, lastTap = null;
    const centre = () => {
      const [a, b] = pts.values();
      return b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) } : { x: a.x, y: a.y, d: 0 };
    };
    // (Re)starts the gesture from where things are now, when a finger lands or lifts.
    const begin = () => {
      gest = { ...centre(), on: gest?.on || false };
      scene.gestureStart();
    };
    const onDown = (e) => {
      if (!live || pts.size >= 2 || (e.pointerType === 'mouse' && e.button !== 0)) return;
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
      if (!gest.on) room.style.cursor = 'grabbing';
      gest.on = dragged = true;
      scene.gesture(dx, dy, scale);
    };
    const onUp = (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      pts.delete(e.pointerId);
      if (pts.size) {
        begin();
        return;
      }
      room.style.cursor = 'grab';
      if (gest?.on) scene.gestureEnd();
      else if (e.pointerType !== 'mouse') {
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
    const onDouble = (e) => {
      if (live && !e.target.closest('[data-hot]')) scene.reset();
    };
    // The wheel zooms where the page itself has nothing to scroll.
    const onWheel = (e) => {
      if (!live || document.documentElement.scrollHeight > innerHeight + 1) return;
      e.preventDefault();
      scene.zoomBy(Math.exp(-e.deltaY * 0.0016));
    };

    if (!navigator.connection?.saveData) {
      scene = mountRoom(canvas, {
        lite,
        phone,
        // Phones open on the whole room and glide in to the desk.
        intro: phone && !reduce,
        onReady: () => {
          live = liveRef.current = true;
          sceneRef.current = scene;
          fitRef.current();
          room.style.touchAction = 'none';
          room.style.cursor = 'grab';
          canvas.style.opacity = 1;
          reveal(hotFrame);
        },
        onLayout: (rects) => hotspots.forEach((h, i) => hotRefs.current[i] && Object.assign(hotRefs.current[i].style, rects[h.key], { display: '' })),
        onFail: flat
      });
      if (import.meta.env.DEV) window.__room = scene;
    } else {
      reveal(still);
      reveal(hotFrame);
    }
    if (follow) addEventListener('pointermove', onMove, { passive: true });
    room.addEventListener('pointerdown', onDown);
    room.addEventListener('gesturestart', noPageZoom);
    room.addEventListener('dblclick', onDouble);
    room.addEventListener('wheel', onWheel, { passive: false });
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
      room.removeEventListener('dblclick', onDouble);
      room.removeEventListener('wheel', onWheel);
      sceneRef.current = null;
      scene?.destroy();
    };
  }, []);

  const frameStyle = { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transition: 'opacity .9s ease' };

  return (
    <section ref={ref} data-stage="" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        ref={roomRef}
        data-room=""
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate3d(-50%,-50%,0)',
          width: '100vw', aspectRatio: `${IMG_W}/${IMG_H}`, overflow: 'hidden',
          userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none'
        }}
      >
        {/* A picture of the same room, for when the 3D one can't run. */}
        <div ref={stillRef} style={frameStyle}>
          <img
            src="/assets/room-still.webp"
            alt="A dark bedroom studio: desk with laptop, tablet, framed portrait, and a bass guitar."
            draggable="false"
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, transition: 'opacity .9s ease' }}
        />
        <div data-vignette="round" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(78% 62% at 52% 48%,rgba(11,13,12,0) 40%,rgba(11,13,12,.5) 100%)', pointerEvents: 'none' }} />
        <div data-vignette="ends" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(11,13,12,.7) 0%,rgba(11,13,12,0) 24%,rgba(11,13,12,0) 66%,rgba(11,13,12,.8) 100%)', pointerEvents: 'none' }} />

        <div ref={hotFrameRef} style={{ ...frameStyle, pointerEvents: 'none' }}>
          {hotspots.map((h, i) => (
            <button
              key={h.key}
              ref={(el) => (hotRefs.current[i] = el)}
              data-hot=""
              aria-label={h.ariaLabel}
              aria-pressed={h.key === 'lamp' ? lampOn : undefined}
              onClick={(e) => {
                if (h.key === 'lamp') {
                  // The lamp is a real switch (the still picture has no lamp to switch).
                  if (sceneRef.current) setLampOn(sceneRef.current.toggleLamp());
                  return;
                }
                if (h.key === 'memories') {
                  // The polaroid wall opens nothing: a tap toggles the close look (hover does it with a mouse).
                  memoriesRef.current = !memoriesRef.current;
                  sceneRef.current?.setFocus(memoriesRef.current ? 'memories' : null);
                  return;
                }
                sceneRef.current?.setFocus(h.key, true);
                onOpen(h.key, e);
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse' || e.buttons) return;
                const held = heldRef.current;
                if (held && held.key !== h.key && inRect(e, held.rect)) return;
                heldRef.current = { key: h.key, el: e.currentTarget, rect: held?.key === h.key ? held.rect : e.currentTarget.getBoundingClientRect() };
                sceneRef.current?.setFocus(h.key);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== 'mouse') return;
                // Moving in shifts the object out from under the cursor; it stays focused
                // until the cursor leaves where the object was before the move.
                if (e.relatedTarget && heldRef.current?.key === h.key && inRect(e, heldRef.current.rect)) return;
                heldRef.current = null;
                sceneRef.current?.setFocus(null);
              }}
              onFocus={() => sceneRef.current?.setFocus(h.key)}
              onBlur={() => {
                memoriesRef.current = false;
                sceneRef.current?.setFocus(null);
              }}
              style={{ position: 'absolute', ...h.rect, cursor: h.key === 'memories' ? 'zoom-in' : 'pointer', background: 'none', border: 0, pointerEvents: 'auto' }}
            >
              {/* The polaroid wall just moves in on hover: no marker or label on it. */}
              {h.key !== 'memories' && <>
              <span data-beacon="" data-small={h.small ? '' : undefined} aria-hidden="true" />
              <span
                data-plate={h.plate}
                style={{
                  position: 'absolute', width: 'max-content', maxWidth: 230, opacity: 0, pointerEvents: 'none',
                  transition: 'opacity .4s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)',
                  ...plateStyle[h.plate]
                }}
              >
                <span style={{ display: 'block', fontFamily: "'Bodoni Moda',serif", fontSize: h.small ? 19 : 30, lineHeight: 1, letterSpacing: '-.02em', color: '#F7F0F0', textShadow: '0 2px 18px rgba(11,13,12,.9)' }}>
                  {h.key === 'lamp' ? (lampOn ? 'Lamp off' : 'Lamp on') : h.label}
                </span>
              </span>
              </>}
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
          <span data-hint-hover="">Drag to look around. Click a lit object to enter.</span>
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
