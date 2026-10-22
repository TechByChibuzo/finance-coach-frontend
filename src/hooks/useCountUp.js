import { useEffect, useState } from 'react';

const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Counts from 0 to target once, easing out, for a page's headline number. Shows the
 * target straight away when the user prefers reduced motion.
 */
export default function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const animate = !reduceMotion && Number.isFinite(target);

  useEffect(() => {
    if (!animate) return undefined;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(target * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, target, duration]);

  return animate ? value : target;
}
