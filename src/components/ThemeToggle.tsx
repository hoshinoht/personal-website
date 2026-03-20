import { useState, useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from '../styles/components/ThemeToggle.module.scss';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => {
    const btn = btnRef.current;
    if (!btn) {
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      return;
    }

    // Get button center coordinates for the circle origin
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate the radius needed to cover the entire viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // Use View Transitions API if available
    if ('startViewTransition' in document) {
      const transition = (document as any).startViewTransition(() => {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.2, 0, 0, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    } else {
      // Fallback: just swap immediately
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    }
  };

  return (
    <button
      ref={btnRef}
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
