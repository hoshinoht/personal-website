import { useState } from 'react';
import { Mail, Github, Linkedin, MessageCircle } from 'lucide-react';
import { bio } from '../data/portfolio';
import { useScrolledPast } from '../lib/useScrolledPast';
import { cn } from '../lib/utils';
import styles from '../styles/components/ContactFab.module.scss';

const links = [
  { icon: Mail, label: 'Email Me', href: `mailto:${bio.email}` },
  { icon: Github, label: 'My GitHub', href: bio.github },
  { icon: Linkedin, label: 'My LinkedIn', href: bio.linkedin },
];

export function ContactFab() {
  const [open, setOpen] = useState(false);
  const visible = useScrolledPast('hero');

  return (
    <div className={cn(styles.container, visible && styles.visible)}>
      <div className={cn(styles.links, open && styles.linksOpen)}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.label === 'Email Me' ? undefined : '_blank'}
            rel={link.label === 'Email Me' ? undefined : 'noopener noreferrer'}
            className={styles.link}
            aria-label={link.label}
            tabIndex={open ? 0 : -1}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </a>
        ))}
      </div>

      <button
        className={cn(styles.fab, open && styles.fabOpen)}
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? 'Close contact menu' : 'Contact me'}
        title="Contact me"
      >
        <MessageCircle size={20} className={cn(styles.fabIcon, open && styles.fabIconRotated)} />
      </button>
    </div>
  );
}
