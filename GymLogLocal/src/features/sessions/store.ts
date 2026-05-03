import dayjs from 'dayjs';
import { create } from 'zustand';
import { getDb } from '@/db/client';

export type Session = { id: number; date: string; notes: string };

type SessionState = {
  sessions: Session[];
  loadSessions: () => void;
  addSession: (notes?: string) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  loadSessions: () => {
    const rows = getDb().getAllSync<Session>('SELECT * FROM sessions ORDER BY date DESC;');
    set({ sessions: rows });
  },
  addSession: (notes = '') => {
    const date = dayjs().toISOString();
    getDb().runSync('INSERT INTO sessions (date, notes) VALUES (?, ?);', [date, notes]);
    const rows = getDb().getAllSync<Session>('SELECT * FROM sessions ORDER BY date DESC;');
    set({ sessions: rows });
  },
}));
