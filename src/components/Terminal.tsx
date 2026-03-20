import { useState, useEffect, useRef, useCallback } from 'react';
import { bio, experiences, projects, skillCategories, certifications, education } from '../data/portfolio';
import styles from '../styles/components/Terminal.module.scss';

const HELP_TEXT = `Available commands:
  whoami       — about me
  ls           — list sections
  ls <section> — list items (projects, skills, exp, edu, hero)
  cat <name>   — show project details
  clear        — clear terminal
  help         — show this help
  exit         — close terminal`;

function processCommand(input: string): string {
  const [cmd, ...args] = input.trim().toLowerCase().split(/\s+/);
  const arg = args.join(' ');

  switch (cmd) {
    case 'help':
    case '?':
      return HELP_TEXT;

    case 'whoami':
      return `${bio.name}\n${bio.roles.join(' | ')}\n\n${bio.summary}\n\nEmail: ${bio.email}\nGitHub: ${bio.github}`;

    case 'ls':
      if (!arg || arg === 'sections') {
        return 'hero  experience  projects  skills  education';
      }
      if (arg === 'hero') {
        return `${bio.name}\n${bio.roles.join(' | ')}\n\nLinks:\n  Email: ${bio.email}\n  GitHub: ${bio.github}\n  LinkedIn: ${bio.linkedin}`;
      }
      if (arg === 'projects' || arg === 'project') {
        return projects
          .map((p) => `${p.featured ? '★' : ' '} ${p.name.padEnd(35)} ${p.period}`)
          .join('\n');
      }
      if (arg === 'skills' || arg === 'skill') {
        return skillCategories
          .map((c) => `${c.name}\n  ${c.skills.map((s) => s.name).join(', ')}`)
          .join('\n\n');
      }
      if (arg === 'exp' || arg === 'experience') {
        return experiences
          .map((e) => `${e.title}\n  ${e.company} | ${e.period}`)
          .join('\n\n');
      }
      if (arg === 'edu' || arg === 'education') {
        const eduStr = education
          .map((e) => `${e.degree}, ${e.field}\n  ${e.institution} | ${e.period}`)
          .join('\n\n');
        const certStr = certifications.map((c) => `${c.name} — ${c.issuer}`).join('\n');
        return `Education:\n${eduStr}\n\nCertifications:\n${certStr}`;
      }
      return `ls: unknown argument '${arg}'. Try: hero, projects, skills, exp, edu`;

    case 'cat': {
      if (!arg) return 'cat: missing argument. Usage: cat <project-name>';
      const proj = projects.find(
        (p) => p.name.toLowerCase().includes(arg) || p.id.includes(arg),
      );
      if (!proj) return `cat: project '${arg}' not found. Try 'ls projects'`;
      let out = `${proj.name} (${proj.period}) [${proj.type}]\n`;
      out += `${proj.summary}\n`;
      if (proj.tech.length) out += `\nTech: ${proj.tech.join(', ')}`;
      if (proj.impact.length) out += `\n\nImpact:\n${proj.impact.map((i) => `  ✦ ${i}`).join('\n')}`;
      if (proj.responsibilities.length) out += `\n\nResponsibilities:\n${proj.responsibilities.map((r) => `  ▸ ${r}`).join('\n')}`;
      return out;
    }

    case 'cd':
      if (arg) {
        // Scroll to section if it exists
        return `__NAVIGATE__${arg}`;
      }
      return 'cd: missing argument. Try: hero, experience, projects, skills, education';

    case 'exit':
    case 'quit':
    case 'q':
      return '__EXIT__';

    case 'clear':
      return '__CLEAR__';

    case 'sudo':
      return 'Nice try.';

    case 'rm':
      return 'Permission denied. This portfolio is protected under CC BY-NC-ND 4.0.';

    case 'neofetch':
      return `\x1b[mauve]${bio.name}\x1b[reset]@\x1b[teal]portfolio\x1b[reset]\n──────────────────\n\x1b[pink]OS\x1b[reset]      React 19 + Vite 6\n\x1b[pink]Theme\x1b[reset]   Catppuccin Dusk\n\x1b[pink]Shell\x1b[reset]   Starship + zsh\n\x1b[pink]Term\x1b[reset]    Ghostty\n\x1b[pink]Font\x1b[reset]    Google Sans Code\n\x1b[pink]Projects\x1b[reset] ${projects.length}\n\x1b[pink]Skills\x1b[reset]  ${skillCategories.reduce((n, c) => n + c.skills.length, 0)}\n\x1b[pink]Commits\x1b[reset] 700+`;

    case 'hack':
      return '█▓▒░ ACCESSING MAINFRAME ░▒▓█\n\n[████████████████████] 100%\n\nACCESS GRANTED.\n\nJust kidding. But if you\'re reading this, you\'re my kind of person.\nFeel free to reach out — I love building things with curious people.';

    case 'coffee':
    case 'brew':
      return '  ( (\n   ) )\n ........\n |      |]\n \\      /\n  `----\'\n\nHere\'s a virtual kopi. ☕';

    case 'ping':
      return 'PONG! 🏓 (0ms latency — you\'re on localhost after all)';

    case 'uptime':
      return `Portfolio has been live since Jan 2026.\nCurrent session: ${Math.floor(performance.now() / 1000)}s`;

    case 'fortune':
    case 'cowsay': {
      const fortunes = [
        'The best code is no code at all.',
        'Premature optimization is the root of all evil. — Knuth',
        'Make it work, make it right, make it fast. — Kent Beck',
        'Weeks of coding can save hours of planning.',
        'It works on my machine. Ship the machine.',
      ];
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    }

    default:
      return `command not found: ${cmd}. Type 'help' for available commands.`;
  }
}

// Parse simple color codes for neofetch output
function renderColoredText(text: string): React.ReactNode {
  const colorMap: Record<string, string> = {
    mauve: 'var(--color-mauve)',
    teal: 'var(--color-teal)',
    pink: 'var(--color-pink)',
    green: 'var(--color-green)',
    yellow: 'var(--color-yellow)',
    sky: 'var(--color-sky)',
    red: 'var(--color-red)',
    reset: '',
  };

  const parts = text.split(/\x1b\[(\w+)\]/);
  if (parts.length === 1) return text;

  const nodes: React.ReactNode[] = [];
  let currentColor: string | null = null;

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      // This is a color name
      currentColor = parts[i] === 'reset' ? null : (colorMap[parts[i]] || null);
    } else if (parts[i]) {
      nodes.push(
        currentColor
          ? <span key={i} style={{ color: currentColor }}>{parts[i]}</span>
          : parts[i],
      );
    }
  }
  return nodes;
}

interface HistoryEntry {
  input: string;
  output: string;
}

export function Terminal() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (history.length === 0) {
        setHistory([{ input: '', output: "Welcome to Po Haoting's terminal. Type 'help' to get started." }]);
      }
    }
  }, [open, history.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const submit = useCallback(() => {
    if (!input.trim()) return;
    const output = processCommand(input);

    if (output === '__EXIT__') {
      setOpen(false);
      return;
    }
    if (output === '__CLEAR__') {
      setHistory([]);
      setInput('');
      return;
    }
    if (output.startsWith('__NAVIGATE__')) {
      const section = output.replace('__NAVIGATE__', '');
      const sectionMap: Record<string, string> = {
        hero: 'hero', home: 'hero',
        exp: 'experience', experience: 'experience', work: 'experience',
        projects: 'projects', project: 'projects',
        skills: 'skills', skill: 'skills',
        edu: 'education', education: 'education',
      };
      const targetId = sectionMap[section];
      if (targetId) {
        setOpen(false);
        setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' }), 100);
        setHistory((h) => [...h, { input, output: `Navigating to ${section}...` }]);
      } else {
        setHistory((h) => [...h, { input, output: `cd: unknown section '${section}'. Try: hero, experience, projects, skills, education` }]);
      }
      setCmdHistory((h) => [input, ...h]);
      setInput('');
      setHistoryIndex(-1);
      return;
    }

    setHistory((h) => [...h, { input, output }]);
    setCmdHistory((h) => [input, ...h]);
    setInput('');
    setHistoryIndex(-1);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const next = Math.min(historyIndex + 1, cmdHistory.length - 1);
        setHistoryIndex(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const next = historyIndex - 1;
        setHistoryIndex(next);
        setInput(cmdHistory[next]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.terminal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.titleBar}>
          <div className={styles.dots}>
            <span className={styles.dotRed} onClick={() => setOpen(false)} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <span className={styles.titleText}>
            <span className={styles.titleIcon}>👻</span> haoting@portfolio
          </span>
        </div>

        <div className={styles.body} ref={scrollRef}>
          {history.map((entry, i) => (
            <div key={i} className={styles.entry}>
              {entry.input && (
                <div className={styles.inputLine}>
                  <div><span className={styles.promptDir}>.../portfolio </span><span className={styles.promptGit}>main </span><span className={styles.promptDirty}>!</span></div>
                  <div><span className={styles.promptChar}>❯</span> {entry.input}</div>
                </div>
              )}
              <pre className={styles.output}>{renderColoredText(entry.output)}</pre>
            </div>
          ))}

          <div className={styles.inputLine}>
            <div><span className={styles.promptDir}>.../portfolio </span><span className={styles.promptGit}>main </span><span className={styles.promptDirty}>!</span></div>
            <div className={styles.promptLine2}><span className={styles.promptChar}>❯</span><input
              ref={inputRef}
              className={styles.inputField}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
