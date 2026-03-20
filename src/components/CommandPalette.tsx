import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Briefcase, FolderGit2, Wrench, GraduationCap, X } from 'lucide-react';
import { experiences, projects, skillCategories, education, sections } from '../data/portfolio';
import styles from '../styles/components/CommandPalette.module.css';

interface SearchResult {
  type: 'section' | 'experience' | 'project' | 'skill' | 'education';
  title: string;
  subtitle: string;
  action: () => void;
}

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  // Sections
  for (const s of sections) {
    results.push({
      type: 'section',
      title: s.label,
      subtitle: 'Section',
      action: () => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }),
    });
  }

  // Experiences
  for (const exp of experiences) {
    results.push({
      type: 'experience',
      title: `${exp.title} — ${exp.company}`,
      subtitle: exp.period,
      action: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }),
    });
  }

  // Projects
  for (const proj of projects) {
    results.push({
      type: 'project',
      title: proj.name,
      subtitle: proj.tech.slice(0, 5).join(', '),
      action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }),
    });
  }

  // Skills (individual)
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      results.push({
        type: 'skill',
        title: skill.name,
        subtitle: `${cat.name} — ${skill.proficiency}`,
        action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }),
      });
    }
  }

  // Education
  for (const edu of education) {
    results.push({
      type: 'education',
      title: edu.institution,
      subtitle: `${edu.degree}, ${edu.field}`,
      action: () => document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' }),
    });
  }

  return results;
}

const typeIcons = {
  section: Search,
  experience: Briefcase,
  project: FolderGit2,
  skill: Wrench,
  education: GraduationCap,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 8);
    const q = query.toLowerCase();
    return index
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [query, index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      results[selectedIndex].action();
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search projects, skills, experience..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search portfolio"
          />
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className={styles.results} ref={listRef}>
          {results.length === 0 && (
            <p className={styles.empty}>No results for "{query}"</p>
          )}
          {results.map((result, i) => {
            const Icon = typeIcons[result.type];
            return (
              <button
                key={`${result.type}-${result.title}-${i}`}
                className={`${styles.result} ${i === selectedIndex ? styles.resultActive : ''}`}
                onClick={() => {
                  result.action();
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <Icon size={16} className={styles.resultIcon} />
                <div className={styles.resultText}>
                  <span className={styles.resultTitle}>{result.title}</span>
                  <span className={styles.resultSubtitle}>{result.subtitle}</span>
                </div>
                <span className={styles.resultType}>{result.type}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.footer}>
          <kbd className={styles.kbd}>↑↓</kbd> navigate
          <kbd className={styles.kbd}>↵</kbd> select
          <kbd className={styles.kbd}>esc</kbd> close
        </div>
      </div>
    </div>
  );
}
