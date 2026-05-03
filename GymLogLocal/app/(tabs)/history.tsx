import dayjs from 'dayjs';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSessionStore } from '@/features/sessions/store';

export default function HistoryScreen() {
  const { sessions, loadSessions } = useSessionStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Session History</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Link href={`/session/${item.id}`} style={{ paddingVertical: 10 }}>
            {dayjs(item.date).format('MMM D, YYYY h:mm A')} — {item.notes || 'No notes'}
          </Link>
        )}
      />
    </View>
  );
}
