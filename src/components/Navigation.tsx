import { useState, useEffect } from 'react';
import { sections } from '../data/portfolio';
import { cn } from '../lib/utils';
import styles from '../styles/components/Navigation.module.css';

export function Navigation() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-10% 0px -10% 0px' },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={cn(styles.nav, 'no-print')} aria-label="Section navigation">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          className={cn(styles.dot, activeSection === id && styles.dotActive)}
          onClick={() => scrollTo(id)}
          aria-label={`Go to ${label}`}
          aria-current={activeSection === id ? 'true' : undefined}
        >
          <span className={styles.tooltip}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
