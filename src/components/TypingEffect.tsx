import { useState, useEffect } from 'react';
import styles from '../styles/components/Hero.module.css';

interface TypingEffectProps {
  roles: string[];
}

export function TypingEffect({ roles }: TypingEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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
            setTimeout(() => setIsDeleting(true), pauseDuration);
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

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRoleIndex, roles]);

  return (
    <div className={styles.roleContainer} aria-label={`Role: ${roles[currentRoleIndex]}`}>
      {displayText}
      <span className={`${styles.cursor} animate-blink`}>|</span>
    </div>
  );
}
