import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import styles from '../../styles/components/Card.module.css';

interface CardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: ReactNode;
  className?: string;
}

export function Card({ variant = 'elevated', children, className }: CardProps) {
  return (
    <div className={cn(styles.card, styles[variant], className)}>
      {children}
    </div>
  );
}
