import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import { bio } from '../data/portfolio';
import { Button } from './ui/Button';
import { TypingEffect } from './TypingEffect';
import { GitHubStatus } from './GitHubStatus';
import { CurrentlyLearning } from './CurrentlyLearning';
import styles from '../styles/components/Hero.module.scss';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning, I\'m';
  if (hour < 18) return 'Good afternoon, I\'m';
  return 'Good evening, I\'m';
}

export function Hero() {
  const greeting = useMemo(getGreeting, []);

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.heroBackground} />
      <div className={styles.heroContent}>
        <motion.div
          className={styles.heroText}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          <p className={styles.greeting}>{greeting}</p>
          <h1 className={styles.name}>{bio.name}</h1>
          <TypingEffect roles={bio.roles} />
          <p className={styles.summary}>{bio.summary}</p>
          <div className={styles.actions}>
            <Button href={`mailto:${bio.email}`} variant="filled" aria-label="Send email">
              <Mail size={18} /> Email
            </Button>
            <Button href={bio.github} variant="tonal" aria-label="GitHub profile">
              <Github size={18} /> GitHub
            </Button>
            <Button href={bio.linkedin} variant="outlined" aria-label="LinkedIn profile">
              <Linkedin size={18} /> LinkedIn
            </Button>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className={styles.statusRow}
          >
            <GitHubStatus />
            <CurrentlyLearning />
          </motion.div>
        </motion.div>
        <motion.div
          className={styles.photoContainer}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <picture>
            <source srcSet="/images/profile.webp" type="image/webp" />
            <img
              src="/images/profile.png"
              alt="Po Haoting"
              className={styles.photo}
              width={280}
              height={280}
              loading="eager"
            />
          </picture>
        </motion.div>
      </div>
    </section>
  );
}
