import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { photos } from '../data/photos.js';

const N = photos.length;
const isReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PhotoCarousel() {
  const cardRefs = useRef([]);
  const idxRef = useRef(0);
  const labelRef = useRef(null);
  const timerRef = useRef(null);

  function layout(animate) {
    const idx = idxRef.current;
    cardRefs.current.forEach((c, i) => {
      if (!c) return;
      const d = (i - idx + N) % N;
      const to = { x: d * 20, y: d * -7, rotate: d * 1.6, scale: 1 - d * 0.05, opacity: d > 3 ? 0 : 1 };
      c.style.zIndex = String(N - d);
      if (animate) gsap.to(c, { ...to, duration: isReduced() ? 0.12 : 0.62, ease: 'power3.out', overwrite: 'auto' });
      else gsap.set(c, to);
    });
    if (labelRef.current) {
      const pad = (v) => (v < 10 ? '0' : '') + v;
      labelRef.current.textContent = `${pad(idx + 1)} / ${pad(N)}`;
    }
  }

  function advance() {
    idxRef.current = (idxRef.current + 1) % N;
    layout(true);
  }

  function arm() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (document.hidden) return;
      advance();
    }, 5000);
  }

  useLayoutEffect(() => {
    layout(false);
    arm();
    return () => clearInterval(timerRef.current);
  }, []);

  function handleClick() {
    advance();
    arm();
  }
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      advance();
      arm();
    }
  }

  return (
    <div data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Next photo"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{ position: 'relative', width: '100%', aspectRatio: '4/5', cursor: 'pointer', paddingRight: 'clamp(22px,4vw,56px)' }}
      >
        {photos.map((p, i) => (
          <div
            key={p.src}
            ref={(el) => (cardRefs.current[i] = el)}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 'calc(100% - clamp(22px,4vw,56px))', height: '100%',
              border: '1px solid rgba(247,240,240,.14)', borderRadius: 12, overflow: 'hidden',
              background: '#12100F', boxShadow: '0 34px 70px -34px rgba(0,0,0,.9)', willChange: 'transform,opacity'
            }}
          >
            <img
              src={p.src}
              alt="Shiyan Gunasegaram"
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.objectPosition, filter: 'saturate(.3) contrast(1.1) brightness(.8)' }}
            />
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(172deg,rgba(92,0,41,.4) 0%,rgba(92,0,41,.1) 46%,rgba(11,13,12,.66) 100%)', mixBlendMode: 'multiply', pointerEvents: 'none' }} />
          </div>
        ))}
      </div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 9.5, letterSpacing: '.24em', textTransform: 'uppercase', color: '#84828F' }}>
        <span ref={labelRef}>01 / 06</span>
        <span style={{ flex: 1, height: 1, background: 'rgba(247,240,240,.14)' }} />
        Click for the next one
      </span>
    </div>
  );
}
