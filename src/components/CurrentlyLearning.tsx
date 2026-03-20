import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import styles from '../styles/components/CurrentlyLearning.module.scss';

const topics = [
  'Rust async runtimes',
  'Federated learning',
  'eBPF observability',
  'WebAssembly edge compute',
  'Transformer architectures',
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
