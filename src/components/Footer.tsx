import { Github, Linkedin, Mail } from 'lucide-react';
import { bio } from '../data/portfolio';
import styles from '../styles/components/Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.links}>
          <a href={`mailto:${bio.email}`} className={styles.link} aria-label="Email">
            <Mail size={18} /> Email
          </a>
          <a href={bio.github} className={styles.link} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={18} /> GitHub
          </a>
          <a href={bio.linkedin} className={styles.link} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={18} /> LinkedIn
          </a>
        </div>
        <div className={styles.shortcuts}>
          <span className={styles.shortcut}><kbd>⌘K</kbd> Search</span>
          <span className={styles.shortcut}><kbd>`</kbd> Terminal</span>
          <span className={styles.shortcut}><kbd>J</kbd><kbd>K</kbd> Navigate</span>
        </div>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Po Haoting. Except where otherwise noted, content on this site is licensed under a{' '}
          <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY-NC-ND 4.0 License
          </a>.
          <br />
          Built with React &amp; Vite.{' '}
          <a href="https://github.com/hoshinoht/personal-website" target="_blank" rel="noopener noreferrer">
            View source
          </a>.
        </p>
      </div>
    </footer>
  );
}
