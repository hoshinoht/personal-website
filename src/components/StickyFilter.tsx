import { motion } from 'framer-motion';
import {
  Brain,
  Cloud,
  Server,
  Cpu,
  Smartphone,
  Gamepad2,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { domains, type Domain } from '../data/portfolio';
import { useFilter } from './FilterContext';
import { cn } from '../lib/utils';
import styles from '../styles/components/StickyFilter.module.css';

const domainIcons: Record<Domain, typeof Brain> = {
  'ML & AI': Brain,
  'Cloud & DevOps': Cloud,
  'Systems & Backend': Server,
  'IoT & Embedded': Cpu,
  'Mobile': Smartphone,
  'Game Dev & XR': Gamepad2,
  'Full Stack & Web': Globe,
};

export function StickyFilter() {
  const { activeDomain, setActiveDomain } = useFilter();

  return (
    <div className={cn(styles.wrapper, 'no-print')}>
      <div className={styles.bar} role="toolbar" aria-label="Filter by domain">
        <div className={styles.inner}>
          <span className={styles.label}>Show me:</span>

          <motion.button
            className={cn(
              styles.pill,
              styles.viewAll,
              activeDomain === null && styles.viewAllActive,
            )}
            onClick={() => setActiveDomain(null)}
            aria-pressed={activeDomain === null}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <LayoutGrid className={styles.icon} />
            All
          </motion.button>

          {domains.map((domain, i) => {
            const Icon = domainIcons[domain];
            const isActive = activeDomain === domain;
            return (
              <motion.button
                key={domain}
                className={cn(styles.pill, isActive && styles.pillActive)}
                onClick={() => setActiveDomain(isActive ? null : domain)}
                aria-pressed={isActive}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.25, delay: (i + 1) * 0.04 }}
              >
                <Icon className={cn(styles.icon, isActive && styles.iconActive)} />
                {domain}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
