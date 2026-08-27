import { forwardRef } from 'react';
import PanelHeader from '../PanelHeader.jsx';
import { workProjects } from '../../data/work.js';
import { useScrollReveal } from '../../lib/useScrollReveal.js';

const WorkPanel = forwardRef(function WorkPanel({ closeRef, onClose, onOpen }, ref) {
  useScrollReveal(ref, []);

  return (
    <div
      ref={ref}
      data-panel="work"
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'linear-gradient(180deg,rgba(11,13,12,.24) 0%,rgba(11,13,12,.88) 38vh,#0B0D0C 78vh)',
        backdropFilter: 'blur(26px) saturate(140%)', WebkitBackdropFilter: 'blur(26px) saturate(140%)',
        willChange: 'transform,opacity,filter'
      }}
    >
      <div data-scroller="" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <PanelHeader label="Technical Projects" closeRef={closeRef} onClose={onClose} />

        <div data-panelhead="" style={{ padding: 'clamp(48px,9vh,110px) clamp(18px,3.2vw,44px) clamp(34px,5vh,64px)', maxWidth: 1500 }}>
          <h1 data-in="" style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontWeight: 400, fontSize: 'clamp(42px,9.2vw,150px)', lineHeight: 0.88, letterSpacing: '-.035em', color: '#F7F0F0', textWrap: 'balance' }}>
            Technical <em style={{ fontStyle: 'italic', color: '#E0A6BE' }}>Projects</em>
          </h1>
          <p data-in="" style={{ margin: 'clamp(26px,4vh,44px) 0 0', maxWidth: '52ch', fontSize: 'clamp(14.5px,1.15vw,18px)', fontWeight: 300, lineHeight: 1.62, color: 'rgba(247,240,240,.72)', textWrap: 'pretty' }}>
            Products I shipped as the person holding the problem: scoping it, designing it, then writing enough of it to know whether the idea actually survives contact with a build.
          </p>
        </div>

        <div data-works="" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(34px,7vh,110px)', padding: 'clamp(10px,2vh,26px) clamp(18px,3.2vw,44px) clamp(30px,5vh,70px)' }}>
          {workProjects.map((p) => {
            const image = (
              <span data-workimg="" style={{ display: 'block', position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#12100F' }}>
                <img data-bow="" data-bow-radius="14" src={p.image} alt={p.alt} style={{ display: 'block', width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 14 }} />
              </span>
            );
            const text = (
              <span data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(9px,1.2vh,16px)' }}>
                <span data-worktitle="" style={{ fontWeight: 200, fontSize: 'clamp(38px,6.4vw,104px)', lineHeight: 0.94, letterSpacing: '-.035em', color: '#C8E9C4', transition: 'color .45s' }}>
                  {p.title}
                </span>
                <span style={{ fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 'clamp(15px,1.5vw,24px)', lineHeight: 1.36, letterSpacing: '-.01em', color: 'rgba(247,240,240,.66)', maxWidth: '32ch', textWrap: 'pretty' }}>
                  {p.subtitle}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 'clamp(6px,1vh,12px)', fontSize: 9.5, letterSpacing: '.24em', textTransform: 'uppercase', color: '#84828F' }}>
                  {p.linkLabel} <span data-workarrow="" style={{ opacity: 0.5, transition: 'opacity .4s cubic-bezier(.22,1,.36,1),transform .4s cubic-bezier(.22,1,.36,1)' }}>↗</span>
                </span>
              </span>
            );
            return (
              <a
                key={p.title}
                data-work=""
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 'clamp(18px,4vw,72px)', alignItems: 'center', textDecoration: 'none' }}
              >
                {p.imageFirst ? (
                  <>
                    {image}
                    {text}
                  </>
                ) : (
                  <>
                    {text}
                    {image}
                  </>
                )}
              </a>
            );
          })}
        </div>

        <div data-reveal="" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: 'clamp(38px,6vh,80px) clamp(18px,3.2vw,44px) clamp(58px,9vh,120px)' }}>
          <span style={{ fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 'clamp(22px,2.6vw,40px)', lineHeight: 1.15, letterSpacing: '-.02em', color: 'rgba(247,240,240,.62)', maxWidth: '26ch', textWrap: 'pretty' }}>
            Next, the part that plugs in.
          </span>
          <button
            onClick={(e) => onOpen('music', e)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '15px 22px', border: '1px solid rgba(247,240,240,.18)', borderRadius: 999, fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(247,240,240,.04)', minHeight: 48 }}
          >
            Music Tech Projects <span style={{ color: '#E0A6BE' }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default WorkPanel;
