import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, FlatList, Text, TextInput, View } from 'react-native';
import { exerciseRepo } from '@/db/repositories/exerciseRepo';
import type { Exercise } from '@/db/types';
import { LoadingErrorState } from '@/src/components/LoadingErrorState';
import { exerciseSchema, type ExerciseForm } from '@/src/features/exercises/schema';

export default function ExercisesScreen() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ExerciseForm>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', muscle_group: '' },
  });

  const load = () => {
    try {
      setLoading(true);
      setError(null);
      setItems(exerciseRepo.list());
    } catch {
      setError('Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = handleSubmit((values) => {
    try {
      setError(null);
      if (editing) {
        exerciseRepo.updateNameAndMuscleGroup(editing.id, values.name, values.muscle_group || null);
      } else {
        exerciseRepo.create({ id: crypto.randomUUID(), name: values.name, muscle_group: values.muscle_group || null });
      }
      setEditing(null);
      reset({ name: '', muscle_group: '' });
      load();
    } catch {
      setError('Failed to save exercise.');
    }
  });

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Exercises</Text>
      <LoadingErrorState loading={loading} error={error} />
      <Controller control={control} name="name" render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          <TextInput placeholder="Exercise name" value={value} onChangeText={onChange} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }} />
          {error ? <Text style={{ color: 'red' }}>{error.message}</Text> : null}
        </View>
      )} />
      <Controller control={control} name="muscle_group" render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          <TextInput placeholder="Muscle group (optional)" value={value ?? ''} onChangeText={onChange} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }} />
          {error ? <Text style={{ color: 'red' }}>{error.message}</Text> : null}
        </View>
      )} />
      <Button title={editing ? 'Update Exercise' : 'Add Exercise'} onPress={onSubmit} />
      {editing ? <Button title="Cancel Edit" onPress={() => { setEditing(null); reset({ name: '', muscle_group: '' }); }} /> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No exercises yet. Add one above.</Text>}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#efefef' }}>
            <Text style={{ fontWeight: '600' }}>{item.name}</Text>
            <Text>{item.muscle_group ?? 'No muscle group'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <Button title="Edit" onPress={() => { setEditing(item); reset({ name: item.name, muscle_group: item.muscle_group ?? '' }); }} />
              <Button title="Delete" color="red" onPress={() => Alert.alert('Delete Exercise', `Delete ${item.name}?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { exerciseRepo.remove(item.id); load(); } }])} />
            </View>
          </View>
        )}
      />
    </View>
  );
}
