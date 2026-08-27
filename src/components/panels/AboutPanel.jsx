import { forwardRef } from 'react';
import PanelHeader from '../PanelHeader.jsx';
import PhotoCarousel from '../PhotoCarousel.jsx';
import { useScrollReveal } from '../../lib/useScrollReveal.js';
import { EMAIL_HREF, LINKEDIN_HREF } from '../Header.jsx';

const AboutPanel = forwardRef(function AboutPanel({ closeRef, onClose }, ref) {
  useScrollReveal(ref, []);

  return (
    <div
      ref={ref}
      data-panel="about"
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'linear-gradient(180deg,rgba(11,13,12,.24) 0%,rgba(11,13,12,.88) 38vh,#0B0D0C 78vh)',
        backdropFilter: 'blur(26px) saturate(140%)', WebkitBackdropFilter: 'blur(26px) saturate(140%)',
        willChange: 'transform,opacity,filter'
      }}
    >
      <div data-scroller="" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <PanelHeader label="About" closeRef={closeRef} onClose={onClose} />

        <div data-panelhead="" style={{ padding: 'clamp(48px,9vh,110px) clamp(18px,3.2vw,44px) clamp(30px,4.5vh,56px)', maxWidth: 1500 }}>
          <h1 data-in="" style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontWeight: 400, fontSize: 'clamp(54px,12.4vw,196px)', lineHeight: 0.86, letterSpacing: '-.04em', color: '#F7F0F0' }}>
            About <em style={{ fontStyle: 'italic', color: '#E0A6BE' }}>Me</em>
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 'clamp(28px,4vw,72px)', alignItems: 'start', padding: '0 clamp(18px,3.2vw,44px) clamp(40px,6vh,80px)', maxWidth: 1500 }}>
          <PhotoCarousel />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(26px,3.6vh,44px)' }}>
            <p data-reveal="" style={{ margin: 0, fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(24px,2.9vw,46px)', lineHeight: 1.18, letterSpacing: '-.025em', color: '#F7F0F0', textWrap: 'pretty' }}>
              I got into product and design through code, realizing I cared just as much about <em style={{ fontStyle: 'italic', color: '#E0A6BE' }}>how things feel</em> as how they work.
            </p>
            <p data-reveal="" style={{ margin: 0, maxWidth: '56ch', fontSize: 'clamp(14.5px,1.15vw,18px)', fontWeight: 300, lineHeight: 1.68, color: 'rgba(247,240,240,.74)', textWrap: 'pretty' }}>
              I studied Cognitive Systems with a minor in Applied Music Technology @ UBC, and I&rsquo;m an aspiring Product Manager in entertainment, especially film, music, and games. Outside of work, I&rsquo;m usually playing guitar, making music, or watching way too many films, but I am on new adventures trying new things I haven&rsquo;t done before :)
            </p>

            <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: 1, background: 'rgba(247,240,240,.12)', border: '1px solid rgba(247,240,240,.12)' }}>
              <StatTile eyebrow="Studied" title="Cognitive Systems, UBC" sub="Minor in Applied Music Technology" />
              <StatTile eyebrow="Aiming at" title="Product Management" sub="Film · Music · Games" />
              <StatTile eyebrow="Shipped" title="4 products · 5 instruments" sub="Scoped, designed, built" />
            </div>
          </div>
        </div>

        <div data-reveal="" style={{ padding: 'clamp(40px,7vh,96px) clamp(18px,3.2vw,44px)', borderTop: '1px solid rgba(247,240,240,.12)', background: 'radial-gradient(120% 140% at 12% 0%,rgba(92,0,41,.34) 0%,rgba(11,13,12,0) 62%)' }}>
          <span style={{ display: 'block', fontSize: 9.5, letterSpacing: '.3em', textTransform: 'uppercase', color: '#84828F', marginBottom: 'clamp(20px,3vh,34px)' }}>Design philosophy</span>
          <blockquote style={{ margin: 0, maxWidth: '24ch', fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(30px,5.6vw,92px)', lineHeight: 1.02, letterSpacing: '-.035em', color: '#F7F0F0', textWrap: 'balance' }}>
            Feel is a feature. Ship it like one.
          </blockquote>
          <p style={{ margin: 'clamp(26px,4vh,44px) 0 0', maxWidth: '50ch', fontSize: 'clamp(14.5px,1.1vw,17px)', fontWeight: 300, lineHeight: 1.68, color: 'rgba(247,240,240,.7)', textWrap: 'pretty' }}>
            Life&nbsp;has taught me that people don&rsquo;t experience features, they experience friction. So I design from the inside out: understand the thought the person is trying to finish, then take everything out of its way. Music keeps me honest about it, a patch either plays or it doesn&rsquo;t, and there&rsquo;s no slide deck that saves a bad one.
          </p>
        </div>

        <div data-reveal="" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 22, padding: 'clamp(40px,7vh,92px) clamp(18px,3.2vw,44px) clamp(58px,9vh,120px)', borderTop: '1px solid rgba(247,240,240,.12)' }}>
          <span style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 'clamp(26px,3.4vw,54px)', lineHeight: 1.06, letterSpacing: '-.03em', maxWidth: '22ch', textWrap: 'balance' }}>
            Let&rsquo;s build something that plays.
          </span>
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href={EMAIL_HREF} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 22px', border: '1px solid rgba(142,6,64,.75)', borderRadius: 999, fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(92,0,41,.4)', minHeight: 48 }}>
              Shiyan.saiyan13@gmail.com <span style={{ color: '#E0A6BE' }}>↗</span>
            </a>
            <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 22px', border: '1px solid rgba(247,240,240,.18)', borderRadius: 999, fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', background: 'rgba(247,240,240,.04)', minHeight: 48 }}>
              LinkedIn <span style={{ color: '#84828F' }}>↗</span>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
});

function StatTile({ eyebrow, title, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '22px 20px', background: '#0B0D0C' }}>
      <span style={{ fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: '#84828F' }}>{eyebrow}</span>
      <span style={{ fontFamily: "'Bodoni Moda',serif", fontSize: 22, lineHeight: 1.14, letterSpacing: '-.02em' }}>{title}</span>
      <span style={{ fontSize: 12, fontWeight: 300, color: 'rgba(247,240,240,.6)' }}>{sub}</span>
    </div>
  );
}

export default AboutPanel;
