import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();

  const pendingEvent: UnratedEvent | null = queue[currentIdx] ?? null;

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/events/unrated');
        setQueue(res.data.events ?? []);
        setCurrentIdx(0);
      } catch {
        showToast({
          type: 'error',
          message: 'Something went wrong in fetching unrated events',
        });
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [showToast]);

  const dismiss = useCallback(async () => {
    const ev = queue[currentIdx];
    if (!ev) return;
    try {
      await api.post(`/events/${ev.id}/dismiss-rating-prompt`);
    } catch {
      showToast({
        type: 'error',
        message: 'Something went wrong while dismissing the rating prompt',
      });
    } finally {
      setCurrentIdx(i => i + 1);
    }
  }, [queue, currentIdx, showToast]);

  const onSubmitted = useCallback(() => {
    setCurrentIdx(i => i + 1);
  }, []);

  return { pendingEvent, dismiss, onSubmitted };
}
