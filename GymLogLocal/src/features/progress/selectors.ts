import dayjs from 'dayjs';
import type { Session } from '@/db/types';

export function buildWeeklyCounts(sessions: Session[]) {
  const days = Array.from({ length: 7 }).map((_, i) => dayjs().subtract(6 - i, 'day'));
  return {
    labels: days.map((d) => d.format('dd')),
    data: days.map((d) => sessions.filter((s) => dayjs(s.started_at).isSame(d, 'day')).length),
  };
}
