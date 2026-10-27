import { forwardRef, useLayoutEffect } from 'react';
import PanelHeader from '../PanelHeader.jsx';
import { liveProject, musicProjects } from '../../data/music.js';
import { useScrollReveal } from '../../lib/useScrollReveal.js';

function openYoutube(id) {
  if (id) window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener');
}

function handleVidKeyDown(id) {
  return (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openYoutube(id);
  };
}

// YouTube serves a 120x90 grey stub (not a 404) when a resolution is missing,
// so onError never fires — detect the stub by size and step down the ladder.
function useThumbFallbackLadder(containerRef) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const LADDER = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault'];
    const imgs = container.querySelectorAll('img[src*="i.ytimg.com"]');
    const cleanups = [];
    imgs.forEach((img) => {
      const step = () => {
        if (img.naturalWidth > 120) return;
        const cur = LADDER.findIndex((r) => img.src.indexOf(r) !== -1);
        if (cur === -1 || cur === LADDER.length - 1) return;
        img.src = img.src.replace(LADDER[cur], LADDER[cur + 1]);
      };
      img.addEventListener('load', step);
      cleanups.push(() => img.removeEventListener('load', step));
      if (img.complete) step();
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
}

function imgFallback(e) {
  const el = e.currentTarget;
  if (el.dataset.fb) return;
  el.dataset.fb = '1';
  el.src = el.src.replace('maxresdefault', 'hqdefault');
}

const MusicPanel = forwardRef(function MusicPanel({ closeRef, onClose }, ref) {
  useScrollReveal(ref, []);
  useThumbFallbackLadder(ref);

  return (
    <div
      ref={ref}
      data-panel="music"
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'linear-gradient(180deg,rgba(11,13,12,.24) 0%,rgba(11,13,12,.88) 38vh,#0B0D0C 78vh)',
        backdropFilter: 'blur(26px) saturate(140%)', WebkitBackdropFilter: 'blur(26px) saturate(140%)',
        willChange: 'transform,opacity,filter'
      }}
    >
      <div data-scroller="" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <PanelHeader label="Music Tech Projects" closeRef={closeRef} onClose={onClose} />

        <div data-panelhead="" style={{ padding: 'clamp(48px,9vh,110px) clamp(18px,3.2vw,44px) clamp(30px,4.5vh,56px)', maxWidth: 1500 }}>
          <h1 data-in="" style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontWeight: 400, fontSize: 'clamp(42px,9.4vw,150px)', lineHeight: 0.88, letterSpacing: '-.035em', color: '#F7F0F0', textWrap: 'balance' }}>
            Music Tech <em style={{ fontStyle: 'italic', color: '#E0A6BE' }}>Projects</em>
          </h1>
          <p data-in="" style={{ margin: 'clamp(26px,4vh,44px) 0 0', maxWidth: '54ch', fontSize: 'clamp(14.5px,1.15vw,18px)', fontWeight: 300, lineHeight: 1.62, color: 'rgba(247,240,240,.72)', textWrap: 'pretty' }}>
            Pieces I&rsquo;ve built as I&rsquo;ve explored music technology. Bringing together everything from Unity, Max/MSP, TouchDesigner, DMX lights, audio production, motion tracking, and real instruments.
            <br />
            <br />
            For every piece, I&rsquo;ve included two videos: the performance itself, and a behind-the-scenes walkthrough of how I built it. Both are open to watch on YouTube.
          </p>
        </div>

        <div data-reveal="" style={{ padding: '0 clamp(18px,3.2vw,44px)' }}>
          <div
            data-vid=""
            role="button"
            tabIndex={0}
            onClick={() => openYoutube(liveProject.id)}
            onKeyDown={handleVidKeyDown(liveProject.id)}
            style={{ position: 'relative', display: 'block', width: '100%', border: '1px solid rgba(247,240,240,.12)', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', background: '#12100F' }}
          >
            <span style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '21/8', overflow: 'hidden' }}>
              <img data-vidimg="" src={liveProject.thumb} onError={imgFallback} alt="LIVE performance" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.6) brightness(.66)', transition: 'transform .8s cubic-bezier(.22,1,.36,1),filter .6s' }} />
              <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(11,13,12,.86) 0%,rgba(11,13,12,.32) 52%,rgba(92,0,41,.34) 100%)' }} />
            </span>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, padding: 'clamp(20px,3vw,44px)' }}>
              <span style={{ fontSize: 9.5, letterSpacing: '.28em', textTransform: 'uppercase', color: '#E0A6BE' }}>{liveProject.kicker}</span>
              <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(38px,6.6vw,104px)', lineHeight: 0.9, letterSpacing: '-.035em', color: '#F7F0F0' }}>{liveProject.title}</span>
                <span data-vidplay="" style={{ display: 'inline-flex', alignItems: 'center', gap: 11, padding: '13px 20px', border: '1px solid rgba(247,240,240,.34)', borderRadius: 999, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(11,13,12,.5)', backdropFilter: 'blur(10px)', opacity: 0.72, transform: 'scale(.97)', transition: 'opacity .4s,transform .5s cubic-bezier(.22,1,.36,1)', minHeight: 44 }}>
                  Watch on YouTube <span style={{ color: '#E0A6BE' }}>↗</span>
                </span>
              </span>
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 'clamp(18px,2.4vw,34px)', padding: 'clamp(18px,2.4vw,34px) clamp(18px,3.2vw,44px) clamp(58px,9vh,120px)' }}>
          {musicProjects.map((mp) => (
            <article key={mp.title} data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div
                data-vid=""
                role="button"
                tabIndex={0}
                onClick={() => openYoutube(mp.performance.id)}
                onKeyDown={handleVidKeyDown(mp.performance.id)}
                style={{ position: 'relative', display: 'block', aspectRatio: '16/9', border: '1px solid rgba(247,240,240,.12)', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', background: '#12100F' }}
              >
                <img data-vidimg="" src={mp.performance.thumb} onError={imgFallback} alt={`${mp.title} performance`} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.62) brightness(.7)', transition: 'transform .8s cubic-bezier(.22,1,.36,1),filter .6s' }} />
                <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(11,13,12,.1) 0%,rgba(11,13,12,.72) 100%)' }} />
                <span data-vidplay="" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) scale(.9)', display: 'grid', placeItems: 'center', width: 62, height: 62, border: '1px solid rgba(247,240,240,.42)', borderRadius: 999, background: 'rgba(11,13,12,.46)', backdropFilter: 'blur(10px)', opacity: 0, transition: 'opacity .4s,transform .5s cubic-bezier(.22,1,.36,1)', color: '#F7F0F0', fontSize: 14 }}>▶</span>
                <span style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(247,240,240,.78)' }}>Performance</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <h2 style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontWeight: 400, fontSize: 'clamp(28px,2.9vw,44px)', lineHeight: 1, letterSpacing: '-.028em', color: '#F7F0F0' }}>{mp.title}</h2>
                <span style={{ fontSize: 10, letterSpacing: '.2em', color: '#84828F' }}>{mp.n}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                <button
                  onClick={() => openYoutube(mp.performance.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '11px 16px', border: '1px solid rgba(142,6,64,.7)', borderRadius: 999, fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', background: 'rgba(92,0,41,.34)', minHeight: 44 }}
                >
                  Performance <span style={{ color: '#E0A6BE' }}>↗</span>
                </button>
                {mp.explanation && (
                  <button
                    onClick={() => openYoutube(mp.explanation.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '11px 16px', border: '1px solid rgba(247,240,240,.16)', borderRadius: 999, fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', background: 'rgba(247,240,240,.04)', minHeight: 44 }}
                  >
                    Explanation <span style={{ color: '#84828F' }}>↗</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MusicPanel;
