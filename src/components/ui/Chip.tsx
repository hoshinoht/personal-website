import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import styles from '../../styles/components/Chip.module.css';

type ChipVariant = 'filled' | 'tonal' | 'outlined';
type ChipColor = 'green' | 'peach' | 'sky' | 'pink' | 'sapphire' | 'mauve' | 'teal' | 'lavender';

interface ChipProps {
  variant?: ChipVariant;
  color?: ChipColor;
  children: ReactNode;
  className?: string;
}

export function Chip({ variant = 'tonal', color, children, className }: ChipProps) {
  return (
    <span className={cn(styles.chip, color ? styles[color] : styles[variant], className)}>
      {children}
    </span>
  );
}
