import { motion, AnimatePresence } from 'framer-motion';
import { experiences } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { Chip } from './ui/Chip';
import styles from '../styles/components/Experience.module.css';

export function ExperienceTimeline() {
  const { activeDomain } = useFilter();

  const filtered = activeDomain
    ? experiences.filter((exp) => exp.domains.includes(activeDomain))
    : experiences;

  if (filtered.length === 0) return null;

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
          {filtered.map((exp, i) => (
            <motion.div
              key={exp.id}
              className={styles.timelineItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              layout
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className={styles.timelineDot} />
              <div className={styles.card}>
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
                  </div>
                </div>
                <div className={styles.bullets}>
                  {exp.bullets.map((bullet, j) => (
                    <p key={j} className={styles.bullet}>{bullet}</p>
                  ))}
                </div>
                <div className={styles.skills}>
                  {exp.skills.map((skill) => (
                    <Chip key={skill} variant="tonal">{skill}</Chip>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
