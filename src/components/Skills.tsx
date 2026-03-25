import { motion } from 'framer-motion';
import { skillCategories, domainToSkillCategories } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { Chip } from './ui/Chip';
import styles from '../styles/components/Skills.module.scss';

const proficiencyVariant = {
  advanced: 'filled',
  intermediate: 'tonal',
  familiar: 'outlined',
} as const;

export function Skills() {
  const { activeDomain } = useFilter();

  const relevantCategoryNames = activeDomain
    ? new Set(domainToSkillCategories[activeDomain])
    : null;

  return (
    <section id="skills" className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        Skills
      </motion.h2>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <Chip variant="filled">Advanced</Chip>
        </span>
        <span className={styles.legendItem}>
          <Chip variant="tonal">Intermediate</Chip>
        </span>
        <span className={styles.legendItem}>
          <Chip variant="outlined">Familiar</Chip>
        </span>
      </div>

      <div className={styles.grid}>
        {skillCategories.map((category, i) => {
          const isRelevant = !relevantCategoryNames || relevantCategoryNames.has(category.name);
          return (
            <div
              key={category.name}
              className={styles.categoryWrap}
              style={{ opacity: isRelevant ? 1 : 0.15 }}
            >
              <motion.div
                className={styles.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <h3 className={styles.categoryName}>{category.name}</h3>
                <div className={styles.chips}>
                  {category.skills.map((skill) => (
                    <Chip key={skill.name} variant={proficiencyVariant[skill.proficiency]}>
                      {skill.name}
                    </Chip>
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
