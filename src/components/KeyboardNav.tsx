import { useEffect } from 'react';
import { sections } from '../data/portfolio';

export function KeyboardNav() {
  useEffect(() => {
    const sectionIds = sections.map((s) => s.id);

    const getCurrentIndex = (): number => {
      const scrollY = window.scrollY + window.innerHeight / 3;
      let current = 0;
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollY) current = i;
      }
      return current;
    };

    const handler = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        const idx = getCurrentIndex();
        const next = e.key === 'j'
          ? Math.min(idx + 1, sectionIds.length - 1)
          : Math.max(idx - 1, 0);
        document.getElementById(sectionIds[next])?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return null;
}
