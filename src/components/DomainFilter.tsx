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
import styles from '../styles/components/DomainFilter.module.css';

const domainIcons: Record<Domain, typeof Brain> = {
  'ML & AI': Brain,
  'Cloud & DevOps': Cloud,
  'Systems & Backend': Server,
  'IoT & Embedded': Cpu,
  'Mobile': Smartphone,
  'Game Dev & XR': Gamepad2,
  'Full Stack & Web': Globe,
};

export function DomainFilter() {
  const { activeDomain, setActiveDomain } = useFilter();

  return (
    <div className={styles.filterBar} role="toolbar" aria-label="Filter by domain">
      <span className={styles.label}>I'm interested in:</span>

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
        View All
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
            <Icon className={styles.icon} />
            {domain}
          </button>
        );
      })}
    </div>
  );
}
