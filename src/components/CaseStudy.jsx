import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// A project's case study, full screen over the Technical Projects page. The top
// bar keeps "back" on the left and links to each section on the right, like a
// small site of its own; the link for the section being read is lit.

const PINK = '#E0A6BE', MUTED = 'rgba(247,240,240,.68)', LINE = 'rgba(247,240,240,.12)', GREY = '#84828F';
const eyebrow = { fontSize: 9.5, letterSpacing: '.26em', textTransform: 'uppercase', color: PINK };
const body = { margin: 0, maxWidth: '68ch', fontSize: 'clamp(15px,1.12vw,17.5px)', fontWeight: 300, lineHeight: 1.72, color: MUTED, textWrap: 'pretty' };
const card = { padding: 'clamp(16px,1.6vw,22px)', border: `1px solid ${LINE}`, borderRadius: 12, background: 'rgba(247,240,240,.035)' };

export default function CaseStudy({ study, onClose }) {
  const rootRef = useRef(null);
  const scrollerRef = useRef(null);
  const barRef = useRef(null);
  const backRef = useRef(null);
  const nav = [{ id: 'overview', label: 'Overview' }, ...study.sections.map(({ id, label }) => ({ id, label }))];
  const [active, setActive] = useState('overview');

  // In on open; Esc closes the case study only, not the whole Projects page.
  useLayoutEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.fromTo(rootRef.current, { opacity: 0, y: reduce ? 0 : 28 }, { opacity: 1, y: 0, duration: reduce ? 0.2 : 0.55, ease: 'power3.out' });
    backRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      onClose();
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  }, [onClose]);

  // Light the nav link for whichever section crosses the upper third of the screen.
  useEffect(() => {
    const sc = scrollerRef.current;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id.replace('cs-', ''))),
      { root: sc, rootMargin: '-25% 0px -65% 0px' }
    );
    sc.querySelectorAll('[data-cs-section]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [study]);

  const jump = (id) => {
    const sc = scrollerRef.current, el = sc.querySelector(`#cs-${id}`);
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    sc.scrollTo({ top: el.offsetTop - barRef.current.offsetHeight - 12, behavior: reduce ? 'auto' : 'smooth' });
    setActive(id);
  };

  const { overview: o } = study;
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${study.title} case study`}
      data-case=""
      style={{ position: 'fixed', inset: 0, zIndex: 95, background: '#0B0D0C' }}
    >
      <div ref={scrollerRef} style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <div
          ref={barRef}
          data-casebar=""
          style={{
            position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: '10px 24px',
            padding: '14px clamp(18px,3.2vw,44px)', background: 'rgba(11,13,12,.92)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${LINE}`
          }}
        >
          <button
            ref={backRef}
            onClick={onClose}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 9, flexShrink: 0, padding: '10px 15px', minHeight: 40, border: '1px solid rgba(247,240,240,.16)', borderRadius: 999, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(247,240,240,.04)' }}
          >
            <span aria-hidden="true">←</span> Projects
          </button>
          <nav data-casenav="" aria-label="Sections" style={{ display: 'flex', gap: 'clamp(4px,1.6vw,26px)', marginLeft: 'auto', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => jump(n.id)}
                aria-current={active === n.id ? 'true' : undefined}
                style={{
                  flexShrink: 0, padding: '8px 6px', fontSize: 'clamp(13px,1vw,15px)', letterSpacing: '.01em', whiteSpace: 'nowrap',
                  color: active === n.id ? '#F7F0F0' : GREY, borderBottom: `1px solid ${active === n.id ? PINK : 'transparent'}`,
                  transition: 'color .3s, border-color .3s'
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <article style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(46px,8vh,96px)', maxWidth: 1180, margin: '0 auto', padding: 'clamp(36px,7vh,84px) clamp(18px,3.2vw,44px) clamp(70px,12vh,140px)' }}>
          <section id="cs-overview" data-cs-section="" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(22px,3.4vh,36px)' }}>
            <span style={eyebrow}>{study.kicker}</span>
            <h1 style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontWeight: 400, fontSize: 'clamp(44px,8vw,120px)', lineHeight: 0.9, letterSpacing: '-.035em', color: '#F7F0F0' }}>{study.title}</h1>
            <p style={{ margin: 0, maxWidth: '30ch', fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 'clamp(20px,2.3vw,34px)', lineHeight: 1.25, letterSpacing: '-.015em', color: 'rgba(247,240,240,.82)', textWrap: 'pretty' }}>{study.summary}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 1, background: LINE, border: `1px solid ${LINE}` }}>
              {[['Role', o.role], ['Timeline', o.timeline], ['Team', o.team]].map(([k, val]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '18px 20px', background: '#0B0D0C' }}>
                  <span style={{ fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: GREY }}>{k}</span>
                  <span style={{ fontSize: 15, lineHeight: 1.45, color: '#F7F0F0' }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: GREY }}>Skills</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {o.skills.map((s) => (
                  <span key={s} style={{ padding: '7px 13px', border: `1px solid ${LINE}`, borderRadius: 999, fontSize: 12.5, color: 'rgba(247,240,240,.8)' }}>{s}</span>
                ))}
              </div>
            </div>

            {o.awards.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: GREY }}>Awards</span>
                {o.awards.map((a) => (
                  <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#F7F0F0' }}>
                    <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: PINK, boxShadow: '0 0 12px 2px rgba(142,6,64,.7)' }} />
                    {a}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {o.links.map(([label, href], i) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9, padding: '13px 19px', minHeight: 46, borderRadius: 999, fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase',
                    border: `1px solid ${i === 0 ? 'rgba(142,6,64,.75)' : 'rgba(247,240,240,.18)'}`, background: i === 0 ? 'rgba(92,0,41,.4)' : 'rgba(247,240,240,.04)'
                  }}
                >
                  {label} <span aria-hidden="true" style={{ color: i === 0 ? PINK : GREY }}>↗</span>
                </a>
              ))}
            </div>

            <img src={study.image} alt={study.alt} style={{ display: 'block', width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 16, border: `1px solid ${LINE}`, marginTop: 'clamp(6px,2vh,20px)' }} />
          </section>

          {study.sections.map((s) => (
            <section key={s.id} id={`cs-${s.id}`} data-cs-section="" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.6vh,28px)', paddingTop: 'clamp(30px,5vh,56px)', borderTop: `1px solid ${LINE}` }}>
              <span style={eyebrow}>{s.label}</span>
              {s.blocks.map((b, i) => <Block key={i} b={b} />)}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

function Block({ b }) {
  if (b.p) return <p style={body}>{b.p}</p>;
  if (b.quote) {
    return (
      <blockquote style={{ margin: 0, maxWidth: '34ch', paddingLeft: 'clamp(16px,2vw,26px)', borderLeft: `2px solid ${PINK}`, fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 'clamp(22px,2.6vw,38px)', lineHeight: 1.18, letterSpacing: '-.02em', color: '#F7F0F0', textWrap: 'balance' }}>
        {b.quote}
      </blockquote>
    );
  }
  if (b.list) {
    return (
      <ul style={{ ...body, display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 20 }}>
        {b.list.map((t) => <li key={t}>{t}</li>)}
      </ul>
    );
  }
  if (b.stats) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,170px),1fr))', gap: 1, background: LINE, border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
        {b.stats.map(([value, label]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 'clamp(18px,2vw,26px)', background: '#0B0D0C' }}>
            <span style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(30px,3.2vw,46px)', lineHeight: 1, letterSpacing: '-.03em', color: PINK }}>{value}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: MUTED }}>{label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (b.cards) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 'clamp(10px,1.2vw,16px)' }}>
        {b.cards.map(([title, text]) => (
          <div key={title} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 15.5, fontWeight: 500, color: '#F7F0F0' }}>{title}</span>
            <span style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: MUTED }}>{text}</span>
          </div>
        ))}
      </div>
    );
  }
  if (b.table) {
    const { head, rows, highlight } = b.table;
    return (
      <div style={{ overflowX: 'auto', border: `1px solid ${LINE}`, borderRadius: 12 }}>
        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 14, lineHeight: 1.55 }}>
          <thead>
            <tr>
              {head.map((h) => (
                <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 9.5, fontWeight: 400, letterSpacing: '.22em', textTransform: 'uppercase', color: GREY, background: 'rgba(247,240,240,.04)', borderBottom: `1px solid ${LINE}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r[0]} style={{ background: i === highlight ? 'rgba(92,0,41,.28)' : 'none' }}>
                {r.map((c, j) => (
                  <td key={j} style={{ padding: '14px 18px', verticalAlign: 'top', borderTop: i ? `1px solid ${LINE}` : 0, color: j === 0 ? (i === highlight ? PINK : '#F7F0F0') : MUTED, fontWeight: j === 0 ? 500 : 300 }}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (b.embed) return <Slides {...b.embed} />;
  return null;
}

// Slides load only when asked for: the embed is a whole third-party app, so it
// shouldn't slow the case study down for people who just want to read.
function Slides({ src, href, label }) {
  const [on, setOn] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 14, overflow: 'hidden', border: `1px solid ${LINE}`, background: 'radial-gradient(120% 140% at 20% 0%,rgba(92,0,41,.4) 0%,rgba(11,13,12,1) 70%)' }}>
        {on ? (
          <iframe src={src} title={label} allowFullScreen loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
        ) : (
          <button onClick={() => setOn(true)} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', width: '100%' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 22px', border: '1px solid rgba(247,240,240,.3)', borderRadius: 999, fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(11,13,12,.5)' }}>
              <span aria-hidden="true" style={{ color: PINK }}>▶</span> View the slides here
            </span>
          </button>
        )}
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: GREY }}>
        Open {label} in a new tab <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
