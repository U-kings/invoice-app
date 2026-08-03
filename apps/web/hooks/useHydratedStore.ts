// hooks/useHydratedStore.ts
'use client'

import { useState, useEffect } from 'react';

// This hook accepts your Zustand store hook and returns a safe selector
export function useHydratedStore<T, F>(
  store: (callback: (state: T) => F) => F,
  selector: (state: T) => F
) {
  const [hydrated, setHydrated] = useState(false);
  const result = store(selector);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Return the actual state only after mounting on the client side
  return hydrated ? result : null;
}
