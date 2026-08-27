import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fades up every [data-reveal] element inside panelRef the first time it scrolls
// into view within the panel's own [data-scroller].
export function useScrollReveal(panelRef, deps = []) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const sc = panel.querySelector('[data-scroller]');
    const items = gsap.utils.toArray('[data-reveal]', panel);
    const isReduced = reduce();
    if (!sc) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const tweens = items.map((el) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: isReduced ? 0.01 : 0.85,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, scroller: sc, start: 'top 94%', once: true }
        }
      )
    );
    ScrollTrigger.refresh();
    return () => tweens.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
