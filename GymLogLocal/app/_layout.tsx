import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { migrate } from '@/db/migrate';

export default function RootLayout() {
  useEffect(() => {
    migrate();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
