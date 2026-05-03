import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Button, Text, TextInput, View } from 'react-native';
import { sessionSchema, SessionForm } from '@/features/sessions/schema';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { control, handleSubmit } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { notes: '' },
  });

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Session #{id}</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Workout notes"
            value={value}
            onChangeText={onChange}
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 }}
          />
        )}
      />
      <Button title="Save" onPress={handleSubmit(() => {})} />
    </View>
  );
}
