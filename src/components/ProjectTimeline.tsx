import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { projects, experiences, education, type Domain } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { getDomainAccentColor } from '../lib/techColors';
import { cn } from '../lib/utils';
import styles from '../styles/components/ProjectTimeline.module.css';

interface TimelineEntry {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  kind: 'education' | 'life' | 'experience' | 'project';
  featured?: boolean;
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseDate(str: string): number {
  const parts = str.trim().split(/\s+/);
  if (parts.length === 1) return new Date(parseInt(parts[0]), 0).getTime();
  return new Date(parseInt(parts[1]), MONTHS[parts[0]] ?? 0).getTime();
}

function parsePeriod(period: string): { start: number; end: number } {
  const [s, e] = period.split('–').map((x) => x.trim());
  return { start: parseDate(s), end: e === 'Present' ? Date.now() : parseDate(e) };
}

function buildEntries(activeDomain: Domain | null): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // Education
  for (const edu of education) {
    entries.push({
      id: `edu-${edu.institution.slice(0, 10)}`,
      name: edu.institution.includes('Technical') ? 'ITE' : edu.institution.includes('Polytechnic') ? 'Singapore Poly' : 'SIT–UofG',
      ...parsePeriod(edu.period),
      color: 'var(--color-sky)',
      kind: 'education',
    });
  }

  // NS
  entries.push({
    id: 'ns',
    name: 'National Service — SAF',
    ...parsePeriod('Sep 2022 – Sep 2024'),
    color: 'var(--md-sys-color-outline)',
    kind: 'life',
  });

  // Experiences
  for (const exp of experiences) {
    if (activeDomain && !exp.domains.includes(activeDomain)) continue;
    entries.push({
      id: `exp-${exp.id}`,
      name: `${exp.title.split('–')[0].trim()} @ ${exp.company === 'Singapore Institute of Technology' ? 'SIT' : exp.company}`,
      ...parsePeriod(exp.period),
      color: 'var(--color-yellow)',
      kind: 'experience',
    });
  }

  // Projects
  for (const proj of projects) {
    if (activeDomain && !proj.domains.includes(activeDomain)) continue;
    entries.push({
      id: proj.id,
      name: proj.name,
      ...parsePeriod(proj.period),
      color: getDomainAccentColor(proj.domains),
      kind: 'project',
      featured: proj.featured,
    });
  }

  return entries.sort((a, b) => a.start - b.start);
}

// Density scale
const QUARTER_MS = 3 * 30.44 * 24 * 60 * 60 * 1000;

function buildDensityScale(entries: TimelineEntry[], minTime: number, maxTime: number) {
  const quarters: { start: number; end: number; density: number }[] = [];
  let t = minTime;
  while (t < maxTime) {
    const qEnd = Math.min(t + QUARTER_MS, maxTime);
    const density = entries.filter((e) => e.start < qEnd && e.end > t).length;
    quarters.push({ start: t, end: qEnd, density });
    t = qEnd;
  }

  const minWidth = 0.5;
  const rawWidths = quarters.map((q) => Math.max(q.density, minWidth));
  const totalRaw = rawWidths.reduce((a, b) => a + b, 0);
  const cumulative: number[] = [0];
  for (let i = 0; i < rawWidths.length; i++) {
    cumulative.push(cumulative[i] + (rawWidths[i] / totalRaw) * 100);
  }

  const timeToPercent = (time: number): number => {
    const clamped = Math.max(minTime, Math.min(time, maxTime));
    const qIdx = Math.min(Math.floor((clamped - minTime) / QUARTER_MS), quarters.length - 1);
    const q = quarters[qIdx];
    const frac = (clamped - q.start) / (q.end - q.start || 1);
    return cumulative[qIdx] + frac * (cumulative[qIdx + 1] - cumulative[qIdx]);
  };

  return { timeToPercent };
}

// Compact: group into 4 swim lanes, each is ONE row
type Lane = { label: string; entries: TimelineEntry[] };

export function ProjectTimeline() {
  const { activeDomain } = useFilter();
  const [expanded, setExpanded] = useState(false);

  const allEntries = useMemo(() => buildEntries(activeDomain), [activeDomain]);
  if (allEntries.length === 0) return null;

  const minTime = Math.min(...allEntries.map((e) => e.start));
  const maxTime = Math.max(...allEntries.map((e) => e.end));

  const scale = useMemo(
    () => buildDensityScale(allEntries, minTime, maxTime),
    [allEntries, minTime, maxTime],
  );

  const startYear = new Date(minTime).getFullYear();
  const endYear = new Date(maxTime).getFullYear();
  const yearMarkers: { year: number; percent: number }[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const t = new Date(y, 0).getTime();
    if (t >= minTime && t <= maxTime) {
      yearMarkers.push({ year: y, percent: scale.timeToPercent(t) });
    }
  }

  const eduEntries = allEntries.filter((e) => e.kind === 'education');
  const lifeEntries = allEntries.filter((e) => e.kind === 'life');
  const expEntries = allEntries.filter((e) => e.kind === 'experience');
  const projEntries = allEntries.filter((e) => e.kind === 'project');

  const compactLanes: Lane[] = [
    { label: 'Edu', entries: eduEntries },
    { label: 'Life', entries: lifeEntries },
    { label: 'Work', entries: expEntries },
    { label: 'Projects', entries: projEntries.filter((p) => p.featured) },
  ];

  const rowH = 22;
  const gap = 6;
  const topOffset = 28;
  const compactRows = compactLanes.length;
  const expandedRows = allEntries.length;
  const trackHeight = topOffset + (expanded ? expandedRows : compactRows) * (rowH + gap) + 8;

  const barStyle = (entry: TimelineEntry, top: number) => {
    const left = scale.timeToPercent(entry.start);
    const right = scale.timeToPercent(entry.end);
    const w = Math.max(right - left, 1.2);
    return {
      left: `${left}%`,
      width: `${w}%`,
      top: `${top}px`,
      height: `${rowH}px`,
      backgroundColor: entry.kind === 'life' ? undefined : entry.color,
      opacity: entry.kind === 'project' && !entry.featured ? 0.55 : 1,
    };
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Timeline</h2>
      <div className={styles.scroll}>
        <div className={styles.track} style={{ minHeight: `${trackHeight}px` }}>
          {/* Year labels */}
          <div className={styles.yearRow}>
            {yearMarkers.map((m) => (
              <span key={m.year} className={styles.yearLabel} style={{ left: `${m.percent}%` }}>
                {m.year}
              </span>
            ))}
          </div>

          {/* Year grid lines */}
          {yearMarkers.map((m) => (
            <div key={`l-${m.year}`} className={styles.yearLine} style={{ left: `${m.percent}%` }} />
          ))}

          {expanded ? (
            <AnimatePresence>
              {allEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  className={entry.kind === 'life' ? styles.nsBar : styles.bar}
                  style={barStyle(entry, topOffset + i * (rowH + gap))}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: entry.kind === 'project' && !entry.featured ? 0.55 : 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.01 }}
                  title={entry.name}
                >
                  <span className={styles.barLabel}>{entry.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            /* ─── COMPACT: 4 swim lanes, 1 row each ─── */
            <>
              {/* Lane labels */}
              <div className={styles.laneLabels}>
                {compactLanes.map((lane, i) => (
                  <span
                    key={lane.label}
                    className={styles.laneLabel}
                    style={{ top: `${topOffset + i * (rowH + gap)}px`, height: `${rowH}px` }}
                  >
                    {lane.label}
                  </span>
                ))}
              </div>

              {compactLanes.map((lane, laneIdx) => {
                const top = topOffset + laneIdx * (rowH + gap);
                return lane.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={entry.kind === 'life' ? styles.nsBar : styles.bar}
                    style={barStyle(entry, top)}
                    title={entry.name}
                  >
                    <span className={styles.barLabel}>{entry.name}</span>
                  </div>
                ));
              })}
            </>
          )}
        </div>
      </div>

      <button className={styles.expandBtn} onClick={() => setExpanded((p) => !p)}>
        {expanded ? 'Compact view' : `Expand all ${allEntries.length} entries`}
        <ChevronDown size={14} className={cn(styles.expandIcon, expanded && styles.expandIconOpen)} />
      </button>
    </div>
  );
}
