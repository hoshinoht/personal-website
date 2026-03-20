import { useState, useEffect } from 'react';

/** Returns true once the user has scrolled past the bottom of the given element ID. */
export function useScrolledPast(elementId: string): boolean {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = document.getElementById(elementId);
      if (!el) return;
      setScrolledPast(window.scrollY > el.offsetTop + el.offsetHeight - 100);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [elementId]);

  return scrolledPast;
}
