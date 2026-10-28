import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import styles from '../styles/components/CurrentlyLearning.module.scss';

const topics = [
  'Site reliability engineering',
  'Rust async runtimes',
  'INT8 quantisation for CPU inference',
  'Crash-safe journaling',
  'OpenTelemetry tracing',
];

export function CurrentlyLearning() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % topics.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.badge}>
      <BookOpen size={12} />
      <span className={styles.label}>Exploring:</span>
      <span className={styles.topic} key={index}>{topics[index]}</span>
    </div>
  );
}
