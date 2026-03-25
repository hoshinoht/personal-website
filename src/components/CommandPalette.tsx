import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Briefcase, FolderGit2, Wrench, GraduationCap,
  X, Command,
} from 'lucide-react';
import { bio, experiences, projects, skillCategories, education, sections } from '../data/portfolio';
import { cn } from '../lib/utils';
import { useFocusTrap } from '../lib/useFocusTrap';
import { useTheme } from '../lib/useTheme';
import styles from '../styles/components/CommandPalette.module.scss';

type ResultType = 'action' | 'section' | 'experience' | 'project' | 'skill' | 'education';

interface SearchResult {
  type: ResultType;
  title: string;
  subtitle: string;
  keywords: string; // extra searchable text
  action: () => void;
}

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  // ─── Quick Actions (always at top when relevant) ───
  results.push({
    type: 'action',
    title: 'Open Terminal',
    subtitle: 'Easter egg CLI — explore via commands',
    keywords: 'terminal cmd console shell cli bash zsh',
    action: () => window.dispatchEvent(new CustomEvent('open-terminal')),
  });

  results.push({
    type: 'action',
    title: 'Toggle Theme',
    subtitle: 'Switch between dark and light mode',
    keywords: 'theme dark light mode toggle sun moon catppuccin',
    action: () => {/* replaced at runtime */},
  });

  results.push({
    type: 'action',
    title: 'Copy Email Address',
    subtitle: bio.email,
    keywords: 'email contact copy clipboard mail',
    action: () => { navigator.clipboard.writeText(bio.email); },
  });

  results.push({
    type: 'action',
    title: 'Send Email',
    subtitle: bio.email,
    keywords: 'email contact mail message',
    action: () => { window.location.href = `mailto:${bio.email}`; },
  });

  results.push({
    type: 'action',
    title: 'Match to Job Description',
    subtitle: 'Paste a JD and rank portfolio relevance',
    keywords: 'jd job description match ats resume tailor',
    action: () => {
      // Click the JD matcher FAB
      const fab = document.querySelector('[aria-label="Match to job description"]') as HTMLButtonElement | null;
      fab?.click();
    },
  });

  // ─── Sections ───
  for (const s of sections) {
    results.push({
      type: 'section',
      title: s.label,
      subtitle: 'Jump to section',
      keywords: s.id,
      action: () => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }),
    });
  }

  // ─── Experiences ───
  for (const exp of experiences) {
    results.push({
      type: 'experience',
      title: `${exp.title} — ${exp.company}`,
      subtitle: `${exp.period} · ${exp.skills.join(', ')}`,
      keywords: [...exp.skills, ...exp.domains, exp.type].join(' '),
      action: () => {
        document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
      },
    });
  }

  // ─── Projects (deep link to specific card) ───
  for (const proj of projects) {
    results.push({
      type: 'project',
      title: proj.name,
      subtitle: proj.tech.slice(0, 5).join(', '),
      keywords: [...proj.tech, ...proj.domains, proj.summary].join(' '),
      action: () => {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        // Dispatch event to expand specific project
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('expand-project', { detail: proj.id }));
        }, 400);
      },
    });
  }

  // ─── Skills ───
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      results.push({
        type: 'skill',
        title: skill.name,
        subtitle: `${cat.name} · ${skill.proficiency}`,
        keywords: cat.name,
        action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }),
      });
    }
  }

  // ─── Education ───
  for (const edu of education) {
    results.push({
      type: 'education',
      title: edu.institution,
      subtitle: `${edu.degree}, ${edu.field}`,
      keywords: edu.field,
      action: () => document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' }),
    });
  }

  return results;
}

const typeIcons: Record<ResultType, typeof Search> = {
  action: Command,
  section: Search,
  experience: Briefcase,
  project: FolderGit2,
  skill: Wrench,
  education: GraduationCap,
};

// Simple fuzzy scoring: exact > startsWith > includes > keyword match
function scoreResult(result: SearchResult, query: string): number {
  const q = query.toLowerCase();
  const title = result.title.toLowerCase();
  const subtitle = result.subtitle.toLowerCase();
  const keywords = result.keywords.toLowerCase();

  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (subtitle.includes(q)) return 40;
  if (keywords.includes(q)) return 20;

  // Word-level partial matching
  const qWords = q.split(/\s+/);
  const allText = `${title} ${subtitle} ${keywords}`;
  const matched = qWords.filter((w) => allText.includes(w)).length;
  if (matched > 0) return matched * 10;

  return 0;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  useFocusTrap(paletteRef, open);
  const { toggleTheme } = useTheme();

  const index = useMemo(() => {
    const items = buildIndex();
    const themeAction = items.find((r) => r.title === 'Toggle Theme');
    if (themeAction) themeAction.action = toggleTheme;
    return items;
  }, [toggleTheme]);

  const results = useMemo(() => {
    if (!query.trim()) {
      // Show actions first, then sections
      return [
        ...index.filter((r) => r.type === 'action'),
        ...index.filter((r) => r.type === 'section'),
      ].slice(0, 10);
    }

    return index
      .map((r) => ({ ...r, score: scoreResult(r, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
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
      <div className={styles.palette} ref={paletteRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search or type a command..."
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
                className={cn(styles.result, i === selectedIndex && styles.resultActive)}
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
