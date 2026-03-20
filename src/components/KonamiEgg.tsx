import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/components/KonamiEgg.module.scss';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

const COLORS = ['#C4A2D4', '#6EC4B8', '#B0BCE8', '#82C8A0', '#DDA05C', '#F3BDCA', '#5CB8E4', '#E8C97E'];

export function KonamiEgg() {
  const [, setSequence] = useState<string[]>([]);
  const [triggered, setTriggered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnConfetti = useCallback(() => {
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      setSequence((prev) => {
        const next = [...prev, e.key].slice(-KONAMI.length);
        if (next.length === KONAMI.length && next.every((k, i) => k === KONAMI[i])) {
          setTriggered(true);
          spawnConfetti();
          setTimeout(() => setTriggered(false), 4000);
        }
        return next;
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spawnConfetti]);

  return (
    <>
      {/* Confetti */}
      {particles.length > 0 && (
        <div className={styles.confettiLayer} aria-hidden="true">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className={styles.confetti}
              style={{
                left: `${p.x}%`,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
              }}
              initial={{ y: '-10vh', opacity: 1 }}
              animate={{ y: '110vh', opacity: 0, rotate: p.rotation + 720 }}
              transition={{ duration: 2 + Math.random() * 1.5, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      {/* Message */}
      <AnimatePresence>
        {triggered && (
          <motion.div
            className={styles.message}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            You found the secret! 🎮
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
