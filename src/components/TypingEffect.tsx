import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import styles from '../styles/components/Hero.module.scss';

interface TypingEffectProps {
  roles: string[];
}

export function TypingEffect({ roles }: TypingEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const pauseRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDuration = 2000;

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentRole.length) {
            setDisplayText(currentRole.slice(0, displayText.length + 1));
          } else {
            pauseRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => {
      clearTimeout(timeout);
      clearTimeout(pauseRef.current);
    };
  }, [displayText, isDeleting, currentRoleIndex, roles]);

  return (
    <div className={styles.roleContainer} aria-label={`Role: ${roles[currentRoleIndex]}`}>
      {displayText}
      <span className={cn(styles.cursor, 'animate-blink')}>|</span>
    </div>
  );
}
