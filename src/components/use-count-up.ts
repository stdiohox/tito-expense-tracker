import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * A number that counts from its last value to `target` over `ms` (ease-out), for hero totals.
 * Whole minor units only, so formatMoney never sees fractions. With Reduce Motion on, it jumps
 * straight to the target. Screen readers should be given the final figure, not this value.
 */
export function useCountUp(target: number, ms = 650): number {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    if (reduce || from.current === target) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = from.current;
    const began = Date.now();
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - began) / ms);
      const eased = 1 - (1 - t) ** 3;
      const value = Math.round(start + (target - start) * eased);
      setShown(value);
      from.current = value;
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, ms, reduce]);

  return shown;
}
