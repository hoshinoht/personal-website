import { useState, useEffect } from 'react';
import { GitCommit } from 'lucide-react';
import styles from '../styles/components/GitHubStatus.module.scss';

interface GithubEvent {
  type: string;
  repo: { name: string };
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function GitHubStatus() {
  const [event, setEvent] = useState<{ repo: string; time: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.github.com/users/hoshinoht/events?per_page=5', {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
      .then((r) => r.json())
      .then((events: GithubEvent[]) => {
        const pushEvent = events.find((e) => e.type === 'PushEvent');
        if (pushEvent) {
          setEvent({
            repo: pushEvent.repo.name.split('/')[1],
            time: timeAgo(pushEvent.created_at),
          });
        }
      })
      .catch(() => {}); // Silently fail — non-critical feature

    return () => controller.abort();
  }, []);

  if (!event) return null;

  return (
    <div className={styles.badge} title={`Last push to ${event.repo}`}>
      <span className={styles.dot} />
      <GitCommit size={12} />
      <span className={styles.text}>
        {event.repo} · {event.time}
      </span>
    </div>
  );
}
