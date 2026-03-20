import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Github, Linkedin, X } from 'lucide-react';
import { bio } from '../data/portfolio';
import { useScrolledPast } from '../lib/useScrolledPast';
import styles from '../styles/components/ContactFab.module.css';

const links = [
  { icon: Mail, label: 'Email Me', href: `mailto:${bio.email}` },
  { icon: Github, label: 'My GitHub', href: bio.github },
  { icon: Linkedin, label: 'My LinkedIn', href: bio.linkedin },
];

export function ContactFab() {
  const [open, setOpen] = useState(false);
  const visible = useScrolledPast('hero');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            {open && links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.label === 'Email Me' ? undefined : '_blank'}
                rel={link.label === 'Email Me' ? undefined : 'noopener noreferrer'}
                className={styles.link}
                aria-label={link.label}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <link.icon size={18} />
                <span className={styles.linkLabel}>{link.label}</span>
              </motion.a>
            ))}
          </AnimatePresence>

          <button
            className={styles.fab}
            onClick={() => setOpen((p) => !p)}
            aria-label={open ? 'Close contact menu' : 'Contact me'}
            title="Contact me"
          >
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex' }}
            >
              {open ? <X size={20} /> : <MessageCircle size={20} />}
            </motion.div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
