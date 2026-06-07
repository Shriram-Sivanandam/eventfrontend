import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  limitToLast,
  onValue,
  push,
  serverTimestamp,
} from '@react-native-firebase/database';
import {
  getAuth,
  signInWithCustomToken,
  signOut,
} from '@react-native-firebase/auth';
import api from '../api/client';
import { REALTIME_DB_URL } from '../constants/firebase';

export type ChatMessage = {
  id: string;
  sender_id: string;
  sender_name: string;
  avatar_url?: string;
  content: string;
  created_at: number;
};

type Status = 'connecting' | 'ready' | 'error' | 'kicked';

export function useEventChat(eventId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>('connecting');

  const unsubRef = useRef<(() => void) | null>(null);
  const signedInRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const res = await api.post(`/events/${eventId}/chat/token`);
        const firebaseToken: string = res.data.token;

        const firebaseAuth = getAuth();
        await signInWithCustomToken(firebaseAuth, firebaseToken);
        signedInRef.current = true;

        if (!isMounted) return;

        const db = getDatabase(undefined, REALTIME_DB_URL);
        const chatRef = ref(db, `/chats/${eventId}`);
        const q = query(chatRef, orderByChild('created_at'), limitToLast(100));
        unsubRef.current = onValue(
          q,
          snapshot => {
            if (!isMounted) return;

            const data = snapshot.val();
            if (!data) {
              setMessages([]);
              setStatus('ready');
              return;
            }

            const msgs: ChatMessage[] = Object.entries(data).map(
              ([key, value]: [string, any]) => ({ id: key, ...value }),
            );
            msgs.sort((a, b) => a.created_at - b.created_at);

            setMessages(msgs);
            setStatus('ready');
          },
          (error: any) => {
            console.log('CHAT LISTENER ERROR', error);
            if (error?.code === 'database/permission-denied') {
              setStatus('kicked');
            } else {
              setStatus('error');
            }
          },
        );
      } catch (err: any) {
        console.log('CHAT INIT ERROR', err);
        setStatus('error');
      }
    };

    init();

    return () => {
      isMounted = false;
      if (unsubRef.current) unsubRef.current();
      if (signedInRef.current) {
        const firebaseAuth = getAuth();
        signOut(firebaseAuth).catch(() => {});
      }
    };
  }, [eventId]);

  const sendMessage = useCallback(
    async (
      content: string,
      senderId: string,
      senderName: string,
      avatarUrl?: string,
    ) => {
      if (status !== 'ready') return;
      const db = getDatabase(undefined, REALTIME_DB_URL);
      const chatRef = ref(db, `/chats/${eventId}`);
      await push(chatRef, {
        sender_id: senderId,
        sender_name: senderName,
        avatar_url: avatarUrl ?? null,
        content: content.trim(),
        created_at: serverTimestamp(),
      });
    },
    [eventId, status],
  );

  return { messages, status, sendMessage };
}
