import { useRef } from 'react';
import { motion } from 'framer-motion';
import { projects } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { getDomainAccentColor } from '../lib/techColors';
import styles from '../styles/components/ProjectTimeline.module.css';

// Life events shown as background bands on the timeline
const lifeEvents = [
  { id: 'ns', name: 'National Service — SAF', period: 'Sep 2022 – Sep 2024' },
];

function parseDate(str: string): number {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = str.trim().split(/\s+/);
  if (parts.length === 1) return new Date(parseInt(parts[0]), 0).getTime();
  const month = months[parts[0]] ?? 0;
  const year = parseInt(parts[1]);
  return new Date(year, month).getTime();
}

function parsePeriod(period: string): { start: number; end: number } {
  const [startStr, endStr] = period.split('–').map((s) => s.trim());
  const start = parseDate(startStr);
  const end = endStr === 'Present' ? Date.now() : parseDate(endStr);
  return { start, end };
}

export function ProjectTimeline() {
  const { activeDomain } = useFilter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = activeDomain
    ? projects.filter((p) => p.domains.includes(activeDomain))
    : projects;

  const parsed = filtered
    .map((p) => ({ ...p, ...parsePeriod(p.period) }))
    .sort((a, b) => a.start - b.start);

  if (parsed.length === 0) return null;

  const parsedEvents = lifeEvents.map((e) => ({ ...e, ...parsePeriod(e.period) }));
  const allStarts = [...parsed.map((p) => p.start), ...parsedEvents.map((e) => e.start)];
  const allEnds = [...parsed.map((p) => p.end), ...parsedEvents.map((e) => e.end)];

  const minTime = Math.min(...allStarts);
  const maxTime = Math.max(...allEnds);
  const totalRange = maxTime - minTime || 1;

  const startYear = new Date(minTime).getFullYear();
  const endYear = new Date(maxTime).getFullYear();
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);

  const trackHeight = 32 + parsed.length * 28 + 16;

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll} ref={scrollRef}>
        <div className={styles.track} style={{ minHeight: `${trackHeight}px` }}>
          {/* Life event bands */}
          {parsedEvents.map((evt) => {
            const left = ((evt.start - minTime) / totalRange) * 100;
            const width = ((evt.end - evt.start) / totalRange) * 100;
            return (
              <div
                key={evt.id}
                className={styles.eventBand}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${evt.name}: ${evt.period}`}
              >
                <span className={styles.eventLabel}>{evt.name}</span>
              </div>
            );
          })}

          {/* Year markers */}
          <div className={styles.yearRow}>
            {years.map((y) => {
              const t = new Date(y, 0).getTime();
              const left = ((t - minTime) / totalRange) * 100;
              return (
                <span key={y} className={styles.yearLabel} style={{ left: `${left}%` }}>
                  {y}
                </span>
              );
            })}
          </div>

          {/* Year grid lines */}
          {years.map((y) => {
            const t = new Date(y, 0).getTime();
            const left = ((t - minTime) / totalRange) * 100;
            return <div key={`line-${y}`} className={styles.yearLine} style={{ left: `${left}%` }} />;
          })}

          {/* Project bars */}
          {parsed.map((project, i) => {
            const left = ((project.start - minTime) / totalRange) * 100;
            const width = ((project.end - project.start) / totalRange) * 100;
            const color = getDomainAccentColor(project.domains);
            return (
              <motion.div
                key={project.id}
                className={styles.bar}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 1.5)}%`,
                  top: `${32 + i * 28}px`,
                  backgroundColor: color,
                  opacity: project.featured ? 1 : 0.6,
                }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                title={`${project.name}: ${project.period}`}
              >
                <span className={styles.barLabel}>{project.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
