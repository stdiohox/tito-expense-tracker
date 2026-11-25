import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * 0 → 1 over `ms` (ease-out), restarting whenever `key` changes: drives charts that draw or grow
 * in. With Reduce Motion on it is 1 straight away.
 */
export function useProgress(key: string, ms = 700): number {
  const reduce = useReducedMotion();
  const [p, setP] = useState(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) {
      setP(1);
      return;
    }
    const began = Date.now();
    let frame = requestAnimationFrame(function step() {
      const t = Math.min(1, (Date.now() - began) / ms);
      setP(1 - (1 - t) ** 3);
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [key, ms, reduce]);

  return p;
}
