import { useEffect } from 'react';
import { useSettings } from './store';

/** Applies the density preference to <html data-density=…> so CSS can target it. */
export function useApplyDensity() {
  const density = useSettings((s) => s.density);
  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);
}
