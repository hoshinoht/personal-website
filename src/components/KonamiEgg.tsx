import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
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
  const seqRef = useRef<string[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const handleComplete = useCallback(() => {
    setGameActive(false);
    document.body.style.overflow = '';
    setFadeIn(true);
    setTimeout(() => setFadeIn(false), 1200);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameActive) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const next = [...seqRef.current, e.key].slice(-KONAMI.length);
      seqRef.current = next;
      if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
        if (isDesktop()) {
          document.body.style.overflow = 'hidden';
          setGameActive(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
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
