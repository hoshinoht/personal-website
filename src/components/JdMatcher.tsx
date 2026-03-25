import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Sparkles } from 'lucide-react';
import { projects, experiences, skillCategories, certifications } from '../data/portfolio';
import { useScrolledPast } from '../lib/useScrolledPast';
import { cn } from '../lib/utils';
import styles from '../styles/components/JdMatcher.module.scss';

interface MatchResult {
  type: 'project' | 'experience' | 'skill' | 'certification';
  name: string;
  score: number;
  matchedKeywords: string[];
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\-/\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const ngrams: string[] = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    ngrams.push(`${words[i]} ${words[i + 1]}`);
    if (i < words.length - 2) {
      ngrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }
  return [...new Set(ngrams)];
}

function scoreMatch(keywords: string[], targets: string[]): { score: number; matched: string[] } {
  const kw = new Set(keywords);
  const matched: string[] = [];
  for (const t of targets) {
    const tLower = t.toLowerCase();
    if (kw.has(tLower)) {
      matched.push(t);
    } else {
      for (const k of kw) {
        if (k.includes(tLower) || tLower.includes(k)) {
          matched.push(t);
          break;
        }
      }
    }
  }
  return { score: matched.length, matched: [...new Set(matched)] };
}

function analyzeJd(jdText: string): MatchResult[] {
  const keywords = extractKeywords(jdText);
  const results: MatchResult[] = [];

  for (const proj of projects) {
    const targets = [...proj.tech, ...proj.atsTags, ...proj.domains, proj.name];
    const { score, matched } = scoreMatch(keywords, targets);
    if (score > 0) {
      results.push({ type: 'project', name: proj.name, score, matchedKeywords: matched });
    }
  }

  for (const exp of experiences) {
    const targets = [...exp.skills, ...exp.atsTags, exp.title, exp.company];
    const { score, matched } = scoreMatch(keywords, targets);
    if (score > 0) {
      results.push({ type: 'experience', name: `${exp.title} — ${exp.company}`, score, matchedKeywords: matched });
    }
  }

  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      const targets = [skill.name, ...skill.atsKeywords, cat.name];
      const { score, matched } = scoreMatch(keywords, targets);
      if (score > 0) {
        results.push({ type: 'skill', name: skill.name, score, matchedKeywords: matched });
      }
    }
  }

  for (const cert of certifications) {
    const targets = [cert.name, cert.issuer, ...cert.atsKeywords];
    const { score, matched } = scoreMatch(keywords, targets);
    if (score > 0) {
      results.push({ type: 'certification', name: `${cert.name} — ${cert.issuer}`, score, matchedKeywords: matched });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function JdMatcher() {
  const [open, setOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const visible = useScrolledPast('hero');

  const analyze = () => {
    if (jdText.trim().length < 10) return;
    setResults(analyzeJd(jdText));
  };

  const reset = () => {
    setJdText('');
    setResults(null);
  };

  const maxScore = results && results.length > 0 ? results[0].score : 1;

  return (
    <>
      <button
        className={cn(styles.fab, visible && styles.fabVisible)}
        onClick={() => setOpen(true)}
        aria-label="Match to job description"
        title="Match my portfolio to a job description"
      >
        <Sparkles size={20} />
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <FileText size={20} />
                <h2 className={styles.title}>Match to Job Description</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <p className={styles.description}>
              Paste a job description and I'll show you which of my projects, experience, and skills are most relevant.
            </p>

            <textarea
              className={styles.textarea}
              placeholder="Paste a job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={6}
            />

            <div className={styles.actions}>
              <button className={styles.analyzeBtn} onClick={analyze} disabled={jdText.trim().length < 10}>
                <Sparkles size={16} /> Analyze Match
              </button>
              {results && (
                <button className={styles.resetBtn} onClick={reset}>Clear</button>
              )}
            </div>

            {results && (
              <div className={styles.results}>
                <p className={styles.resultCount}>
                  Top {Math.min(results.length, 15)} of {results.length} matches
                </p>
                {results.slice(0, 15).map((r, i) => {
                  const pct = Math.round((r.score / maxScore) * 100);
                  return (
                    <div key={`${r.type}-${r.name}-${i}`} className={styles.resultItem}>
                      <div className={styles.resultHeader}>
                        <span className={styles.resultName}>{r.name}</span>
                        <div className={styles.resultMeta}>
                          <span className={styles.scoreBadge}>{pct}%</span>
                          <span className={styles.resultType}>{r.type}</span>
                        </div>
                      </div>
                      <div className={styles.scoreBarTrack}>
                        <div className={styles.scoreBar} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={styles.matchedKeywords}>
                        {r.matchedKeywords.map((kw) => (
                          <span key={kw} className={styles.keyword}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}
