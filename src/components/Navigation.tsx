import { useState, useEffect } from 'react';
import { Home, Briefcase, FolderGit2, Wrench, GraduationCap, Sun, Moon } from 'lucide-react';
import { sections } from '../data/portfolio';
import { cn } from '../lib/utils';
import styles from '../styles/components/Navigation.module.scss';

const sectionIcons: Record<string, typeof Home> = {
  hero: Home,
  experience: Briefcase,
  projects: FolderGit2,
  skills: Wrench,
  education: GraduationCap,
};

export function Navigation() {
  const [activeSection, setActiveSection] = useState('hero');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const onScroll = () => {
      const offset = window.scrollY + window.innerHeight / 3;
      let active: string = sections[0].id;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= offset) {
          active = id;
        }
      }
      setActiveSection(active);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <nav className={cn(styles.nav, 'no-print')} aria-label="Section navigation">
      {/* Desktop: dot nav on right */}
      <div className={styles.dotNav}>
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
      </div>

      {/* Mobile: bottom bar */}
      <div className={styles.mobileBar}>
        {sections.map(({ id, label }) => {
          const Icon = sectionIcons[id] || Home;
          return (
            <button
              key={id}
              className={cn(styles.mobileBtn, activeSection === id && styles.mobileBtnActive)}
              onClick={() => scrollTo(id)}
              aria-label={`Go to ${label}`}
              aria-current={activeSection === id ? 'true' : undefined}
            >
              <Icon size={18} />
              <span className={styles.mobileLabel}>{label}</span>
            </button>
          );
        })}
        <button
          className={styles.mobileBtn}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className={styles.mobileLabel}>Theme</span>
        </button>
      </div>
    </nav>
  );
}
