import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import WorkPanel from './components/panels/WorkPanel.jsx';
import MusicPanel from './components/panels/MusicPanel.jsx';
import AboutPanel from './components/panels/AboutPanel.jsx';
import { mountAmbient } from './lib/ambient.js';
import { startWorkBow } from './lib/workBow.js';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'power3.out';

export default function App() {
  const [open, setOpen] = useState(null); // logical target: null | 'work' | 'music' | 'about'
  const [mountedKey, setMountedKey] = useState(null); // what's actually rendered

  const stageRef = useRef(null);
  const panelRef = useRef(null);
  const ambientCanvasRef = useRef(null);
  const ambientApiRef = useRef(null);
  const closeBtnRef = useRef(null);
  const originRef = useRef({ x: null, y: null });

  const reduce = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    if (ambientCanvasRef.current) ambientApiRef.current = mountAmbient(ambientCanvasRef.current);
    const bow = startWorkBow(THREE);
    return () => {
      ambientApiRef.current?.destroy?.();
      bow.stop();
    };
  }, []);

  const openPanel = (key, ev) => {
    if (open === key) return;
    if (ev && ev.currentTarget) {
      const r = ev.currentTarget.getBoundingClientRect();
      originRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    } else {
      originRef.current = { x: null, y: null };
    }
    setOpen(key);
    setMountedKey(key);
  };

  const closePanel = () => {
    if (!open) return;
    setOpen(null);
    const panel = panelRef.current;
    const stage = stageRef.current;
    const cv = ambientCanvasRef.current;
    const done = () => {
      setMountedKey(null);
      ambientApiRef.current?.stop();
    };
    if (!panel) { done(); return; }
    if (cv) gsap.to(cv, { opacity: 0, duration: 0.45, ease: 'sine.in' });
    if (stage) gsap.to(stage, { scale: 1, filter: 'blur(0px) brightness(1)', duration: 0.6, ease: EASE });
    if (reduce) gsap.to(panel, { opacity: 0, duration: 0.18, onComplete: done });
    else gsap.to(panel, { opacity: 0, scale: 0.95, filter: 'blur(14px)', duration: 0.42, ease: 'power2.in', onComplete: done });
  };

  // Esc closes whatever panel is open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) closePanel(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Entrance animation, every time a (new) panel mounts.
  useLayoutEffect(() => {
    if (!mountedKey) return;
    const panel = panelRef.current;
    const stage = stageRef.current;
    const cv = ambientCanvasRef.current;
    ambientApiRef.current?.start();
    if (!panel) return;
    const { x, y } = originRef.current;
    panel.style.transformOrigin = x != null ? `${x}px ${y}px` : '50% 50%';
    if (cv) gsap.to(cv, { opacity: 1, duration: 0.7, ease: 'sine.out' });
    if (reduce) {
      gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.22 });
    } else {
      gsap.fromTo(panel, { opacity: 0, scale: 0.93, filter: 'blur(16px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.62, ease: EASE });
      if (stage) gsap.to(stage, { scale: 1.05, filter: 'blur(9px) brightness(.5)', duration: 0.7, ease: EASE });
      gsap.fromTo(panel.querySelectorAll('[data-in]'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, delay: 0.12, ease: EASE });
    }
    const sc = panel.querySelector('[data-scroller]');
    if (sc) sc.scrollTop = 0;
    const raf = requestAnimationFrame(() => closeBtnRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [mountedKey, reduce]);

  return (
    <div data-root="" style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '100dvh', overflow: 'hidden', background: '#0B0D0C' }}>
      <Header />

      <Hero ref={stageRef} onOpen={openPanel} />

      <canvas
        ref={ambientCanvasRef}
        data-ambient=""
        style={{ position: 'fixed', inset: 0, zIndex: 55, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
      />

      <div data-panels="">
        {mountedKey === 'work' && <WorkPanel ref={panelRef} closeRef={closeBtnRef} onClose={closePanel} onOpen={openPanel} />}
        {mountedKey === 'music' && <MusicPanel ref={panelRef} closeRef={closeBtnRef} onClose={closePanel} />}
        {mountedKey === 'about' && <AboutPanel ref={panelRef} closeRef={closeBtnRef} onClose={closePanel} />}
      </div>
    </div>
  );
}
