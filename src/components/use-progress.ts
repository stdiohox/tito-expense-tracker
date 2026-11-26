import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * 0 → 1 over `ms` (ease-out), restarting whenever `key` changes: drives charts and illustrations
 * that draw or grow in. With `run` false it holds at 0 until run turns true (an intro slide that
 * is not showing yet); `delay` waits before starting. With Reduce Motion on it is 1 straight away.
 */
export function useProgress(key: string, ms = 700, { run = true, delay = 0 }: { run?: boolean; delay?: number } = {}): number {
  const reduce = useReducedMotion();
  const [p, setP] = useState(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) {
      setP(1);
      return;
    }
    setP(0);
    if (!run) return;
    let frame = 0;
    const timer = setTimeout(() => {
      const began = Date.now();
      frame = requestAnimationFrame(function step() {
        const t = Math.min(1, (Date.now() - began) / ms);
        setP(1 - (1 - t) ** 3);
        if (t < 1) frame = requestAnimationFrame(step);
      });
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [key, ms, reduce, run, delay]);

  return p;
}
