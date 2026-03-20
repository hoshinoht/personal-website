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

          <button
            className={cn(
              styles.pill,
              styles.viewAll,
              activeDomain === null && styles.viewAllActive,
            )}
            onClick={() => setActiveDomain(null)}
            aria-pressed={activeDomain === null}
          >
            <LayoutGrid className={styles.icon} />
            All
          </button>

          {domains.map((domain) => {
            const Icon = domainIcons[domain];
            const isActive = activeDomain === domain;
            return (
              <button
                key={domain}
                className={cn(styles.pill, isActive && styles.pillActive)}
                onClick={() => setActiveDomain(isActive ? null : domain)}
                aria-pressed={isActive}
              >
                <Icon className={cn(styles.icon, isActive && styles.iconActive)} />
                {domain}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
