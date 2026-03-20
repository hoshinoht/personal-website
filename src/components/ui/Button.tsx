import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import styles from '../../styles/components/Button.module.scss';

interface ButtonProps {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export function Button({ variant = 'filled', href, children, className, onClick, ...props }: ButtonProps) {
  const classes = cn(styles.button, styles[variant], className);

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
