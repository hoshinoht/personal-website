import { useState, useEffect, useRef, useCallback } from 'react';
import { bio, experiences, projects, skillCategories, certifications, education } from '../data/portfolio';
import styles from '../styles/components/Terminal.module.css';

const HELP_TEXT = `Available commands:
  whoami       — about me
  ls           — list sections
  ls projects  — list all projects
  ls skills    — list skill categories
  ls exp       — list experience
  ls edu       — list education & certs
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
      return `ls: unknown argument '${arg}'. Try: projects, skills, exp, edu`;

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
      return `${bio.name}@portfolio\n──────────────────\nOS: React 19 + Vite 6\nTheme: Catppuccin Dusk\nFont: Inter / JetBrains Mono\nProjects: ${projects.length}\nSkills: ${skillCategories.reduce((n, c) => n + c.skills.length, 0)}\nCommits: 700+`;

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
          <span className={styles.titleText}>haoting@portfolio ~ %</span>
        </div>

        <div className={styles.body} ref={scrollRef}>
          {history.map((entry, i) => (
            <div key={i} className={styles.entry}>
              {entry.input && (
                <div className={styles.inputLine}>
                  <span className={styles.prompt}>❯</span> {entry.input}
                </div>
              )}
              <pre className={styles.output}>{entry.output}</pre>
            </div>
          ))}

          <div className={styles.inputLine}>
            <span className={styles.prompt}>❯</span>
            <input
              ref={inputRef}
              className={styles.inputField}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
