import { forwardRef, useEffect, useRef } from 'react';
import gsap from 'gsap';

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
  }
];

const plateStyle = {
  up: { left: '50%', bottom: 'calc(100% + 20px)', transform: 'translate3d(-50%,10px,0)', textAlign: 'center' },
  side: { right: 6, bottom: 'calc(100% + 14px)', transform: 'translate3d(0,10px,0)', textAlign: 'right' },
  down: { left: '50%', top: 'calc(100% + 18px)', transform: 'translate3d(-50%,-10px,0)', textAlign: 'center' }
};

const Hero = forwardRef(function Hero({ onOpen }, ref) {
  const roomRef = useRef(null);
  const hotRefs = useRef([]);
  const asideRef = useRef(null);

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
    if (!room || reduce || matchMedia('(max-aspect-ratio: 3/2)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e) => {
      tx = (e.clientX / innerWidth - 0.5) * -26;
      ty = (e.clientY / innerHeight - 0.5) * -16;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      room.style.transform = `translate3d(calc(-50% + ${cx.toFixed(2)}px), calc(-50% + ${cy.toFixed(2)}px), 0) scale(1.015)`;
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(tick) : 0;
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => {
      removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} data-stage="" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        ref={roomRef}
        data-room=""
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate3d(-50%,-50%,0)',
          width: '106vw', aspectRatio: '1537/1023', willChange: 'transform'
        }}
      >
        <img
          src="/assets/room.png"
          alt="A dark bedroom studio: desk with laptop, iPad, framed portrait, and a bass guitar."
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.82) contrast(1.04) brightness(.96)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(78% 62% at 52% 48%,rgba(11,13,12,0) 34%,rgba(11,13,12,.62) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(11,13,12,.78) 0%,rgba(11,13,12,0) 26%,rgba(11,13,12,0) 62%,rgba(11,13,12,.86) 100%)', pointerEvents: 'none' }} />

        {hotspots.map((h, i) => (
          <button
            key={h.key}
            ref={(el) => (hotRefs.current[i] = el)}
            data-hot=""
            aria-label={h.ariaLabel}
            onClick={(e) => onOpen(h.key, e)}
            style={{ position: 'absolute', ...h.rect, cursor: 'pointer', background: 'none', border: 0 }}
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

      <div
        ref={asideRef}
        data-heroaside=""
        style={{
          position: 'absolute', left: 'clamp(18px,3.2vw,44px)', bottom: 78, zIndex: 20,
          display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 'min(330px,38vw)', pointerEvents: 'none'
        }}
      >
        <p style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(21px,1.9vw,29px)', lineHeight: 1.22, letterSpacing: '-.015em', color: '#F7F0F0', textWrap: 'pretty' }}>
          Aspiring product manager building at the seam of <em style={{ fontStyle: 'italic', color: '#E0A6BE' }}>sound</em> and software.
        </p>
        <span style={{ fontSize: 10.5, letterSpacing: '.12em', color: '#84828F' }}>Hover a lit object. Click to enter.</span>
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
            onClick={(e) => onOpen(it.key, e)}
            style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '20px 18px', background: '#0B0D0C', textAlign: 'left', minHeight: 64 }}
          >
            <span style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 26, letterSpacing: '-.02em' }}>{it.label}</span>
            <span style={{ fontSize: 9.5, letterSpacing: '.24em', textTransform: 'uppercase', color: '#84828F' }}>{it.n}</span>
          </button>
        ))}
      </div>

      <MarqueeBar />
    </section>
  );
});

export default Hero;

function MarqueeBar() {
  const words = ['Product Management', 'Music Technology', 'Sound Design', 'Cognitive Systems', 'Creative Code', 'Film · Music · Games'];
  const strip = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 34, padding: '11px 17px', fontFamily: "'Bodoni Moda',serif", fontSize: 13.5, letterSpacing: '.24em', textTransform: 'uppercase', color: '#84828F', whiteSpace: 'nowrap' }}>
      {words.map((w) => (
        <span key={w} style={{ display: 'contents' }}>
          {w}
          <span style={{ color: '#8E0640' }}>✳</span>
        </span>
      ))}
    </span>
  );
  return (
    <div
      data-marqueebar=""
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20, overflow: 'hidden',
        borderTop: '1px solid rgba(247,240,240,.1)', background: 'rgba(11,13,12,.55)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', pointerEvents: 'none'
      }}
    >
      <div data-marquee="" style={{ display: 'flex', width: 'max-content', animation: 'sg-marquee 34s linear infinite' }}>
        {strip}
        {strip}
      </div>
    </div>
  );
}
