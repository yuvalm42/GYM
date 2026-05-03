import { Link } from 'expo-router';
import { Button, Text, View } from 'react-native';
import { useSessionStore } from '@/features/sessions/store';

export default function TodayScreen() {
  const { addSession } = useSessionStore();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Today</Text>
      <Button title="Start Workout" onPress={() => addSession('Started from Today tab')} />
      <Link href="/(tabs)/history">Go to History</Link>
    </View>
  );
}
