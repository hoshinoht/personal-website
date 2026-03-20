import { motion } from 'framer-motion';
import { GitCommit, Code, Zap, Container } from 'lucide-react';
import styles from '../styles/components/ImpactStats.module.css';

const stats = [
  { icon: GitCommit, value: '700+', label: 'Commits', color: 'var(--md-sys-color-primary)' },
  { icon: Code, value: '2M+', label: 'Lines of Code', color: 'var(--md-sys-color-secondary)' },
  { icon: Container, value: '10+', label: 'Containers', color: 'var(--md-sys-color-tertiary)' },
  { icon: Zap, value: '<1s', label: 'SOS Alert Delivery', color: 'var(--color-green)' },
];

export function ImpactStats() {
  return (
    <div className={styles.strip}>
      <div className={styles.inner}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.stat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
            <span className={styles.value} style={{ color: stat.color }}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
