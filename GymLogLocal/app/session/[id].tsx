import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, FlatList, Text, View } from 'react-native';
import { exerciseRepo } from '@/db/repositories/exerciseRepo';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import type { Exercise, SessionExercise } from '@/db/types';
import { LoadingErrorState } from '@/src/components/LoadingErrorState';

type SessionExerciseWithName = SessionExercise & { exercise_name: string };

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseWithName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = useMemo(() => id ?? '', [id]);

  const load = () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      setAvailableExercises(exerciseRepo.list());
      setSessionExercises(sessionRepo.listSessionExercisesWithExercise(sessionId));
    } catch {
      setError('Failed to load session data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [sessionId]);

  const addExercise = (exerciseId: string) => {
    sessionRepo.attachExercise({ id: crypto.randomUUID(), session_id: sessionId, exercise_id: exerciseId, order_index: sessionExercises.length });
    load();
  };

  return <View style={{ flex: 1, padding: 16, gap: 10 }}>
    <Text style={{ fontSize: 24, fontWeight: '700' }}>Session #{sessionId}</Text>
    <LoadingErrorState loading={loading} error={error} />

    {sessionExercises.length === 0 ? <View style={{ padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, gap: 8 }}>
      <Text>No exercises in this session yet.</Text>
      <Button title="Add first exercise" onPress={() => {
        if (availableExercises.length === 0) {
          Alert.alert('No exercises', 'Create exercises from Settings > Exercises first.');
          return;
        }
        addExercise(availableExercises[0].id);
      }} />
    </View> : null}

    <Text style={{ fontWeight: '700' }}>Session Exercises</Text>
    <FlatList
      data={sessionExercises}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#efefef', gap: 6 }}>
          <Text>{index + 1}. {item.exercise_name}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Up" onPress={() => { if (index > 0) { sessionRepo.reorderSessionExercise(sessionId, item.id, index - 1); load(); } }} />
            <Button title="Down" onPress={() => { if (index < sessionExercises.length - 1) { sessionRepo.reorderSessionExercise(sessionId, item.id, index + 1); load(); } }} />
            <Button title="Remove" color="red" onPress={() => { sessionRepo.removeSessionExercise(item.id); load(); }} />
          </View>
        </View>
      )}
      ListEmptyComponent={<Text>Use the buttons below to add exercises.</Text>}
    />

    <Text style={{ fontWeight: '700' }}>Add Exercise</Text>
    {availableExercises.map((exercise) => (
      <Button key={exercise.id} title={exercise.name} onPress={() => addExercise(exercise.id)} />
    ))}
  </View>;
}
