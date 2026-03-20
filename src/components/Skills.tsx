import { motion, AnimatePresence } from 'framer-motion';
import { skillCategories, domainToSkillCategories } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { Chip } from './ui/Chip';
import { SkillsRadar } from './SkillsRadar';
import styles from '../styles/components/Skills.module.css';

const proficiencyVariant = {
  advanced: 'filled',
  intermediate: 'tonal',
  familiar: 'outlined',
} as const;

export function Skills() {
  const { activeDomain } = useFilter();

  // When filtered, show matching categories first, then the rest dimmed
  const relevantCategoryNames = activeDomain
    ? new Set(domainToSkillCategories[activeDomain])
    : null;

  const sortedCategories = relevantCategoryNames
    ? [
        ...skillCategories.filter((c) => relevantCategoryNames.has(c.name)),
        ...skillCategories.filter((c) => !relevantCategoryNames.has(c.name)),
      ]
    : skillCategories;

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

      <SkillsRadar />

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
        <AnimatePresence mode="popLayout">
          {sortedCategories.map((category, i) => {
            const isRelevant = !relevantCategoryNames || relevantCategoryNames.has(category.name);
            return (
              <motion.div
                key={category.name}
                className={styles.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isRelevant ? 1 : 0.35 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{ order: isRelevant ? 0 : 1 }}
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
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
