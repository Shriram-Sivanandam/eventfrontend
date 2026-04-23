import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

export type UnratedEvent = {
  id: string;
  title: string;
  image_url?: string;
  host_user_id: string;
  host_name?: string;
  host_avatar?: string;
};

export function useRatingPrompt() {
  const [queue, setQueue] = useState<UnratedEvent[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const pendingEvent: UnratedEvent | null = queue[currentIdx] ?? null;

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/events/unrated');
        setQueue(res.data.events ?? []);
        setCurrentIdx(0);
      } catch (err) {
        console.log('useRatingPrompt error:', err);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(async () => {
    const ev = queue[currentIdx];
    if (!ev) return;
    try {
      await api.post(`/events/${ev.id}/dismiss-rating-prompt`);
    } catch (err) {
      console.log('dismiss prompt error:', err);
    } finally {
      setCurrentIdx(i => i + 1);
    }
  }, [queue, currentIdx]);

  const onSubmitted = useCallback(() => {
    setCurrentIdx(i => i + 1);
  }, []);

  return { pendingEvent, dismiss, onSubmitted };
}
