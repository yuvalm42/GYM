import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';
import { sessionRepo } from '@/db/repositories/sessionRepo';

export default function TodayScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Today</Text>
      <Button
        title="Start Session"
        onPress={() => {
          const id = crypto.randomUUID();
          sessionRepo.create({ id, started_at: new Date().toISOString(), notes: 'Started from Today tab' });
          router.push(`/session/${id}`);
        }}
      />
    </View>
  );
}
