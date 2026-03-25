import { useState, useEffect } from 'react';

/** Returns true once the user has scrolled past the bottom of the given element ID.
 *  Uses IntersectionObserver instead of scroll events for better performance. */
export function useScrolledPast(elementId: string): boolean {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const el = document.getElementById(elementId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [elementId]);

  return scrolledPast;
}
