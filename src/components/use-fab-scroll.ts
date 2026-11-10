import { useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Add-button state from list scrolling: collapse to "+" once scrolled, hide while scrolling
 * down (so it never sits on the amounts being read), and come back on any scroll up.
 */
export function useFabScroll() {
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const dy = y - lastY.current;
    if (Math.abs(dy) > 6) {
      setHidden(dy > 0 && y > 120);
      lastY.current = y;
    }
    setCompact(y > 120);
  };
  return { compact, hidden, onScroll };
}
