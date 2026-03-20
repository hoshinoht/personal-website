import type { Project } from '../data/portfolio';
import { Chip } from './ui/Chip';
import { getTechChipColor } from '../lib/techColors';
import styles from '../styles/components/Projects.module.scss';

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className={styles.otherGrid}>
      {projects.map((project, i) => (
        <div
          key={project.id}
          className={styles.otherCard}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <h4 className={styles.otherName}>{project.name}</h4>
          <p className={styles.otherSummary}>{project.summary}</p>
          <div className={styles.otherTech}>
            {project.tech.map((t) => (
              <Chip key={t} color={getTechChipColor(t)}>{t}</Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
