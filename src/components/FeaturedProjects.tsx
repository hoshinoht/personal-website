import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { projects } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { Chip } from './ui/Chip';
import { ProjectGrid } from './ProjectGrid';
import styles from '../styles/components/Projects.module.css';

export function FeaturedProjects() {
  const { activeDomain } = useFilter();

  const allFiltered = activeDomain
    ? projects.filter((p) => p.domains.includes(activeDomain))
    : projects;

  const featured = allFiltered.filter((p) => p.featured);
  const other = allFiltered.filter((p) => !p.featured);

  if (allFiltered.length === 0) return null;

  return (
    <section id="projects" className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        Projects
        {activeDomain && (
          <span className={styles.filterBadge}>{allFiltered.length} in {activeDomain}</span>
        )}
      </motion.h2>

      {featured.length > 0 && (
        <div className={styles.featuredGrid}>
          <AnimatePresence mode="popLayout">
            {featured.map((project, i) => (
              <motion.div
                key={project.id}
                className={styles.featuredCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div className={styles.cardTop}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <span className={styles.projectPeriod}>{project.period}</span>
                </div>
                <p className={styles.projectSummary}>{project.summary}</p>

                {project.responsibilities.length > 0 && (
                  <div className={styles.responsibilityList}>
                    {project.responsibilities.map((r, j) => (
                      <p key={j} className={styles.responsibility}>{r}</p>
                    ))}
                  </div>
                )}

                {project.impact.length > 0 && (
                  <div className={styles.impactList}>
                    {project.impact.map((imp, j) => (
                      <p key={j} className={styles.impact}>{imp}</p>
                    ))}
                  </div>
                )}

                <div className={styles.techRow}>
                  {project.tech.map((t) => (
                    <Chip key={t} color="sapphire">{t}</Chip>
                  ))}
                </div>

                {project.repo && (
                  <a href={project.repo} className={styles.repoLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} /> View on GitHub
                  </a>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {other.length > 0 && (
        <>
          <h3 className={styles.subheading}>Other Projects</h3>
          <ProjectGrid projects={other} />
        </>
      )}
    </section>
  );
}
