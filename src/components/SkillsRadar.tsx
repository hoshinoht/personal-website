import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { skillCategories, domainToSkillCategories, domains } from '../data/portfolio';
import { useFilter } from './FilterContext';
import styles from '../styles/components/SkillsRadar.module.css';

// Compute a 0-1 score per domain based on skill count and proficiency
function computeDomainScores(): Record<string, number> {
  const profWeight = { advanced: 3, intermediate: 2, familiar: 1 };
  const scores: Record<string, number> = {};
  let maxScore = 0;

  for (const domain of domains) {
    const catNames = domainToSkillCategories[domain] || [];
    let score = 0;
    for (const catName of catNames) {
      const cat = skillCategories.find((c) => c.name === catName);
      if (cat) {
        for (const skill of cat.skills) {
          score += profWeight[skill.proficiency];
        }
      }
    }
    scores[domain] = score;
    if (score > maxScore) maxScore = score;
  }

  // Normalize to 0-1
  for (const d of domains) {
    scores[d] = maxScore > 0 ? scores[d] / maxScore : 0;
  }
  return scores;
}

function polarToXY(cx: number, cy: number, radius: number, angleRad: number) {
  return { x: cx + Math.cos(angleRad) * radius, y: cy + Math.sin(angleRad) * radius };
}

export function SkillsRadar() {
  const { activeDomain } = useFilter();
  const scores = useMemo(computeDomainScores, []);

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const levels = 4;
  const count = domains.length;

  const angles = domains.map((_, i) => (i / count) * Math.PI * 2 - Math.PI / 2);

  // Build polygon points for the data shape
  const dataPoints = domains.map((d, i) => {
    const r = scores[d] * maxR;
    return polarToXY(cx, cy, r, angles[i]);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className={styles.container}>
      <svg viewBox={`0 0 ${size} ${size}`} className={styles.svg}>
        {/* Grid rings */}
        {Array.from({ length: levels }, (_, lvl) => {
          const r = ((lvl + 1) / levels) * maxR;
          const pts = angles.map((a) => polarToXY(cx, cy, r, a));
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return <path key={lvl} d={path} className={styles.gridRing} />;
        })}

        {/* Axis lines */}
        {angles.map((a, i) => {
          const p = polarToXY(cx, cy, maxR, a);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className={styles.axis} />;
        })}

        {/* Data polygon */}
        <motion.path
          d={dataPath}
          className={styles.dataFill}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.path
          d={dataPath}
          className={styles.dataStroke}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => {
          const isActive = activeDomain === null || activeDomain === domains[i];
          return (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={isActive ? 4 : 3}
              className={isActive ? styles.dotActive : styles.dot}
            />
          );
        })}

        {/* Labels */}
        {angles.map((a, i) => {
          const labelR = maxR + 22;
          const p = polarToXY(cx, cy, labelR, a);
          const isActive = activeDomain === null || activeDomain === domains[i];
          const anchor = Math.abs(a) > Math.PI / 2 + 0.2 ? 'end' : Math.abs(a) < Math.PI / 2 - 0.2 ? 'start' : 'middle';
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="central"
              className={isActive ? styles.labelActive : styles.label}
            >
              {domains[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
