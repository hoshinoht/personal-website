import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Github, Linkedin } from 'lucide-react';
import { bio } from '../data/portfolio';
import { useScrolledPast } from '../lib/useScrolledPast';
import styles from '../styles/components/ContactFab.module.css';
import { cn } from '../lib/utils';

const links = [
  { icon: Mail, label: 'Email Me', href: `mailto:${bio.email}` },
  { icon: Github, label: 'My GitHub', href: bio.github },
  { icon: Linkedin, label: 'My LinkedIn', href: bio.linkedin },
];

export function ContactFab() {
  const [open, setOpen] = useState(false);
  const visible = useScrolledPast('hero');

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {open && links.map((link, i) => (
          <motion.a
            key={link.label}
            href={link.href}
            target={link.label === 'Email Me' ? undefined : '_blank'}
            rel={link.label === 'Email Me' ? undefined : 'noopener noreferrer'}
            className={styles.link}
            aria-label={link.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, delay: i * 0.04 }}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </motion.a>
        ))}
      </AnimatePresence>

      <button
        className={cn(styles.fab, open && styles.fabOpen)}
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? 'Close contact menu' : 'Contact me'}
        title="Contact me"
      >
        <MessageCircle size={20} className={cn(styles.fabIcon, open && styles.fabIconHidden)} />
        <span className={cn(styles.fabX, !open && styles.fabXHidden)}>✕</span>
      </button>
    </div>
  );
}
