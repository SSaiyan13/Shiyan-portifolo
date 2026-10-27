import { forwardRef, useEffect, useRef, useState } from 'react';
import PanelHeader from '../PanelHeader.jsx';
import { useScrollReveal } from '../../lib/useScrollReveal.js';

// The photo album behind the polaroid wall in the room: every memory as a
// polaroid, and a viewer to flip through them one at a time.
const PHOTOS = Array.from({ length: 31 }, (_, i) => `/assets/album/memory-${String(i + 1).padStart(2, '0')}.webp`);

const AlbumPanel = forwardRef(function AlbumPanel({ closeRef, onClose }, ref) {
  useScrollReveal(ref, []);
  const [open, setOpen] = useState(null); // index of the photo in the viewer, or null

  return (
    <div
      ref={ref}
      data-panel="memories"
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'linear-gradient(180deg,rgba(11,13,12,.24) 0%,rgba(11,13,12,.88) 38vh,#0B0D0C 78vh)',
        backdropFilter: open === null ? 'blur(26px) saturate(140%)' : 'none', WebkitBackdropFilter: open === null ? 'blur(26px) saturate(140%)' : 'none',
        willChange: 'transform,opacity,filter'
      }}
    >
      <div data-scroller="" inert={open !== null ? true : undefined} style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <PanelHeader label="Memories" closeRef={closeRef} onClose={onClose} />

        <div data-panelhead="" style={{ padding: 'clamp(48px,9vh,110px) clamp(18px,3.2vw,44px) clamp(30px,4.5vh,56px)', maxWidth: 1500 }}>
          <h1 data-in="" style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontWeight: 400, fontSize: 'clamp(54px,12.4vw,196px)', lineHeight: 0.86, letterSpacing: '-.04em', color: '#F7F0F0' }}>
            Memo<em style={{ fontStyle: 'italic', color: '#E0A6BE' }}>ries</em>
          </h1>
          <p data-in="" style={{ margin: 'clamp(26px,4vh,44px) 0 0', maxWidth: '50ch', fontSize: 'clamp(14.5px,1.15vw,18px)', fontWeight: 300, lineHeight: 1.62, color: 'rgba(247,240,240,.72)' }}>
            The polaroids on my wall: friends, teams, trips and nights out. Tap one to look closer.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(42%,180px),1fr))', gap: 'clamp(14px,2vw,28px)', padding: '0 clamp(18px,3.2vw,44px) clamp(58px,9vh,120px)' }}>
          {PHOTOS.map((src, i) => (
            <button
              key={src}
              data-reveal=""
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${PHOTOS.length}`}
              style={{ display: 'block', padding: '8px 8px 26px', background: '#EEE9E0', borderRadius: 3, boxShadow: '0 18px 40px -22px rgba(0,0,0,.9)', transform: `rotate(${((i * 37) % 7) - 3}deg)` }}
            >
              <img src={src} alt="" loading="lazy" decoding="async" style={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      </div>

      {open !== null && <Viewer index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
});

// One photo at a time: arrows, swipe, keyboard; Esc closes the viewer only.
function Viewer({ index, onIndex, onClose }) {
  const n = PHOTOS.length;
  const go = (d) => onIndex((index + d + n) % n);
  const start = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else return;
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  });

  const arrow = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 999, border: '1px solid rgba(247,240,240,.22)', background: 'rgba(11,13,12,.55)', fontSize: 18, color: '#F7F0F0' };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${n}`}
      onPointerDown={(e) => (start.current = e.clientX)}
      onPointerUp={(e) => {
        const dx = start.current === null ? 0 : e.clientX - start.current;
        start.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'grid', placeItems: 'center', background: 'rgba(11,13,12,.96)', touchAction: 'pan-y' }}
    >
      <img src={PHOTOS[index]} alt={`Memory ${index + 1}`} draggable={false} style={{ maxWidth: 'min(92vw,1100px)', maxHeight: '80vh', objectFit: 'contain', borderRadius: 6, boxShadow: '0 30px 80px -30px rgba(0,0,0,.9)', userSelect: 'none' }} />
      <button aria-label="Previous photo" onClick={() => go(-1)} style={{ ...arrow, left: 'clamp(10px,3vw,40px)' }}>←</button>
      <button aria-label="Next photo" onClick={() => go(1)} style={{ ...arrow, right: 'clamp(10px,3vw,40px)' }}>→</button>
      <span style={{ position: 'absolute', bottom: 'clamp(18px,4vh,40px)', fontSize: 10, letterSpacing: '.24em', color: '#84828F' }}>{String(index + 1).padStart(2, '0')} / {n}</span>
      <button
        ref={closeRef}
        onClick={onClose}
        style={{ position: 'absolute', top: 'clamp(14px,3vh,28px)', right: 'clamp(14px,3vw,40px)', display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 15px', minHeight: 40, border: '1px solid rgba(247,240,240,.16)', borderRadius: 999, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(247,240,240,.04)' }}
      >
        Close <span aria-hidden="true" style={{ color: '#84828F' }}>✕</span>
      </button>
    </div>
  );
}

export default AlbumPanel;
