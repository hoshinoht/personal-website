import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, ChevronDown } from 'lucide-react';
import { projects } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { Chip } from './ui/Chip';
import { cn } from '../lib/utils';
import { getTechChipColor, getDomainAccentColor } from '../lib/techColors';
import { highlightMetrics } from '../lib/highlightMetrics';
import { ProjectGrid } from './ProjectGrid';
import { ProjectGraph } from './ProjectGraph';
import styles from '../styles/components/Projects.module.scss';

export function FeaturedProjects() {
  const { activeDomain } = useFilter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Listen for deep-link expand from command palette
  useEffect(() => {
    const handler = (e: Event) => {
      const projectId = (e as CustomEvent).detail;
      setExpandedId(projectId);
    };
    window.addEventListener('expand-project', handler);
    return () => window.removeEventListener('expand-project', handler);
  }, []);

  const allFiltered = activeDomain
    ? projects.filter((p) => p.domains.includes(activeDomain))
    : projects;

  const featured = allFiltered.filter((p) => p.featured);
  const other = allFiltered.filter((p) => !p.featured);

  if (allFiltered.length === 0) return null;

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

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

      <div className={styles.techLegend}>
        <span className={styles.legendItem}><Chip color="mauve">Languages</Chip></span>
        <span className={styles.legendItem}><Chip color="teal">Frameworks</Chip></span>
        <span className={styles.legendItem}><Chip color="lavender">Infrastructure</Chip></span>
        <span className={styles.legendItem}><Chip color="peach">Protocols</Chip></span>
        <span className={styles.legendItem}><Chip color="sapphire">Tools & Patterns</Chip></span>
      </div>

      <ProjectGraph />

      {featured.length > 0 && (
        <div className={styles.featuredGrid}>
            {featured.map((project, i) => {
              const isExpanded = expandedId === project.id;
              const accentColor = getDomainAccentColor(project.domains);
              return (
                <motion.div
                  key={project.id}
                  className={cn(styles.featuredCard, isExpanded && styles.featuredCardExpanded)}
                  style={{ borderLeftColor: accentColor }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <div
                    className={styles.cardClickable}
                    onClick={() => toggle(project.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => e.key === 'Enter' && toggle(project.id)}
                  >
                    <div className={styles.cardTop}>
                      <h3 className={styles.projectName}>{project.name}</h3>
                      <div className={styles.cardTopRight}>
                        <span className={styles.projectPeriod}>{project.period}</span>
                        <ChevronDown
                          size={16}
                          className={cn(styles.chevron, isExpanded && styles.chevronOpen)}
                        />
                      </div>
                    </div>
                    <p className={styles.projectSummary}>{project.summary}</p>
                  </div>

                  <div className={styles.techRow}>
                    {project.tech.slice(0, 6).map((t) => (
                      <Chip key={t} color={getTechChipColor(t)}>{t}</Chip>
                    ))}
                    {project.tech.length > 6 && (
                      <Chip variant="outlined">+{project.tech.length - 6}</Chip>
                    )}
                  </div>

                  {isExpanded && (
                    <div className={styles.expandedContent}>
                      {project.tech.length > 6 && (
                        <div className={styles.techRowFull}>
                          {project.tech.slice(6).map((t) => (
                            <Chip key={t} color={getTechChipColor(t)}>{t}</Chip>
                          ))}
                        </div>
                      )}

                      {project.responsibilities.length > 0 && (
                        <div className={styles.responsibilityList}>
                          {project.responsibilities.map((r, j) => (
                            <p key={j} className={styles.responsibility}>{highlightMetrics(r)}</p>
                          ))}
                        </div>
                      )}

                      {project.impact.length > 0 && (
                        <div className={styles.impactList}>
                          {project.impact.map((imp, j) => (
                            <p key={j} className={styles.impact}>{highlightMetrics(imp, 'impact')}</p>
                          ))}
                        </div>
                      )}

                      {project.repo && (
                        <a
                          href={project.repo}
                          className={styles.repoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github size={14} /> View on GitHub
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
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
