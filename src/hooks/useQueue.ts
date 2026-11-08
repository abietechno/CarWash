import { useEffect, useState } from 'react';
import { fetchQueue, QueueBoard } from '../lib/queue';

const REFRESH_MS = 10_000;

/** Papan antrian publik, diperbarui berkala selama tab terlihat. */
export function useQueue() {
  const [board, setBoard] = useState<QueueBoard | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = () =>
      fetchQueue()
        .then((data) => {
          if (!cancelled) {
            setBoard(data);
            setError(false);
          }
        })
        .catch(() => !cancelled && setError(true));

    load();
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), REFRESH_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { board, error };
}
