import { motion, useScroll } from 'framer-motion';
import styles from '../styles/components/ScrollProgress.module.css';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className={styles.bar}
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
