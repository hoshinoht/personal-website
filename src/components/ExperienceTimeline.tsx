import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { experiences } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { Chip } from './ui/Chip';
import { cn } from '../lib/utils';
import { highlightMetrics } from '../lib/highlightMetrics';
import styles from '../styles/components/Experience.module.css';

export function ExperienceTimeline() {
  const { activeDomain } = useFilter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeDomain
    ? experiences.filter((exp) => exp.domains.includes(activeDomain))
    : experiences;

  if (filtered.length === 0) return null;

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <section id="experience" className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        Experience
      </motion.h2>
      <div className={styles.timeline}>
        <AnimatePresence mode="popLayout">
          {filtered.map((exp, i) => {
            const isExpanded = expandedId === exp.id;
            return (
              <motion.div
                key={exp.id}
                className={styles.timelineItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className={styles.timelineDot} />
                <div
                  className={cn(styles.card, isExpanded && styles.cardExpanded)}
                  onClick={() => toggle(exp.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => e.key === 'Enter' && toggle(exp.id)}
                >
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.title}>{exp.title}</h3>
                      <p className={styles.company}>{exp.company}</p>
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.period}>{exp.period}</span>
                      <span className={`${styles.typeBadge} ${styles[exp.type]}`}>
                        {exp.type}
                      </span>
                      <ChevronDown
                        size={18}
                        className={cn(styles.chevron, isExpanded && styles.chevronOpen)}
                      />
                    </div>
                  </div>

                  <div className={styles.skills}>
                    {exp.skills.map((skill) => (
                      <Chip key={skill} variant="tonal">{skill}</Chip>
                    ))}
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        className={styles.bullets}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        {exp.bullets.map((bullet, j) => (
                          <p key={j} className={styles.bullet}>{highlightMetrics(bullet)}</p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
