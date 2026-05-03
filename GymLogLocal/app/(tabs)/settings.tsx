import { Link } from 'expo-router';
import { Alert, Button, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Settings</Text>
      <Link href="/exercises" style={{ color: 'blue' }}>Manage Exercises</Link>
      <Button title="Export JSON" onPress={() => Alert.alert('Export', 'Local export placeholder')} />
      <Button title="Import JSON" onPress={() => Alert.alert('Import', 'Local import placeholder')} />
    </View>
  );
}
