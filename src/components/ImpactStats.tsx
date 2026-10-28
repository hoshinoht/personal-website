import { motion } from 'framer-motion';
import { Minimize2, FlaskConical, ShieldCheck, Zap } from 'lucide-react';
import styles from '../styles/components/ImpactStats.module.scss';

const stats = [
  // aerial-scene-recognition.i2: INT8 export 5.4x smaller than FP32 with zero accuracy lost
  { icon: Minimize2, value: '5.4×', label: 'Smaller model, zero accuracy lost', color: 'var(--md-sys-color-primary)' },
  // kanade-v5.i2: each change gated on 2,600+ offline Rust tests
  { icon: FlaskConical, value: '2,600+', label: 'Rust tests gating each release', color: 'var(--md-sys-color-secondary)' },
  // shiori.r4: all 172 injected-crash runs restored exactly the old or new state
  { icon: ShieldCheck, value: '172/172', label: 'Injected-crash runs recovered', color: 'var(--md-sys-color-tertiary)' },
  // carehaven.i2: sub-second SOS alert delivery via Redis pub/sub + FCM
  { icon: Zap, value: '<1s', label: 'SOS alert delivery', color: 'var(--color-green)' },
];

export function ImpactStats() {
  return (
    <div className={styles.strip}>
      <div className={styles.inner}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.stat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
            <span className={styles.value} style={{ color: stat.color }}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
