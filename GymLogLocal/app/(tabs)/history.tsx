import dayjs from 'dayjs';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import type { Session } from '@/db/types';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSessions(sessionRepo.list());
    }, []),
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Session History</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/session/${item.id}`} style={{ paddingVertical: 10 }}>
            {dayjs(item.started_at).format('MMM D, YYYY h:mm A')} — {item.notes || 'No notes'}
          </Link>
        )}
      />
    </View>
  );
}
