import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/components/KonamiEgg.module.scss';

const AsteroidsGame = lazy(() =>
  import('./AsteroidsGame').then(m => ({ default: m.AsteroidsGame })),
);

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function isDesktop(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1024;
}

export function KonamiEgg() {
  const [, setSequence] = useState<string[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const handleComplete = useCallback(() => {
    setGameActive(false);
    setFadeIn(true);
    setTimeout(() => setFadeIn(false), 1200);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameActive) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      setSequence(prev => {
        const next = [...prev, e.key].slice(-KONAMI.length);
        if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
          if (isDesktop()) {
            setGameActive(true);
          }
        }
        return next;
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameActive]);

  return (
    <>
      {gameActive && (
        <Suspense fallback={null}>
          <AsteroidsGame onComplete={handleComplete} />
        </Suspense>
      )}

      <AnimatePresence>
        {fadeIn && (
          <motion.div
            className={styles.fadeOverlay}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
