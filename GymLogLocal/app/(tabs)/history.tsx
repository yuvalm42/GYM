import dayjs from 'dayjs';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { sessionRepo, type SessionHistoryItem } from '@/db/repositories/sessionRepo';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSessions(sessionRepo.listWithStats());
    }, []),
  );

  const sorted = useMemo(() => [...sessions].sort((a, b) => dayjs(b.started_at).valueOf() - dayjs(a.started_at).valueOf()), [sessions]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Session History</Text>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const durationMinutes = item.ended_at ? dayjs(item.ended_at).diff(dayjs(item.started_at), 'minute') : null;
          return <Link href={`/session/${item.id}/summary`} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '700' }}>{dayjs(item.started_at).format('MMM D, YYYY h:mm A')}</Text>{'\n'}
            <Text>{durationMinutes !== null ? `${durationMinutes} min` : 'In progress'} • {item.exercise_count} exercises • {item.total_sets} sets</Text>
          </Link>;
        }}
      />
    </View>
  );
}
