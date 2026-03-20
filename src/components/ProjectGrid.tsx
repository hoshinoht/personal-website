import { motion } from 'framer-motion';
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
        <motion.div
          key={project.id}
          className={styles.otherCard}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <h4 className={styles.otherName}>{project.name}</h4>
          <p className={styles.otherSummary}>{project.summary}</p>
          <div className={styles.otherTech}>
            {project.tech.map((t) => (
              <Chip key={t} color={getTechChipColor(t)}>{t}</Chip>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
