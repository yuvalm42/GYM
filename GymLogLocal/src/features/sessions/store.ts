import dayjs from 'dayjs';
import { create } from 'zustand';
import { getDb } from '@/db/client';

export type Session = { id: string; started_at: string; ended_at: string | null; notes: string | null };

type SessionState = {
  sessions: Session[];
  loadSessions: () => void;
  addSession: (id: string, notes?: string) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  loadSessions: () => {
    const rows = getDb().getAllSync<Session>('SELECT * FROM sessions ORDER BY started_at DESC;');
    set({ sessions: rows });
  },
  addSession: (id, notes = '') => {
    const startedAt = dayjs().toISOString();
    getDb().runSync('INSERT INTO sessions (id, started_at, ended_at, notes) VALUES (?, ?, ?, ?);', [
      id,
      startedAt,
      null,
      notes,
    ]);
    const rows = getDb().getAllSync<Session>('SELECT * FROM sessions ORDER BY started_at DESC;');
    set({ sessions: rows });
  },
}));
