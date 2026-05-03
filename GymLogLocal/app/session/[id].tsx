import { useLocalSearchParams, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { exerciseRepo } from '@/db/repositories/exerciseRepo';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import { setRepo } from '@/db/repositories/setRepo';
import type { Exercise, Session, SessionExercise, WorkoutSet } from '@/db/types';
import { LoadingErrorState } from '@/src/components/LoadingErrorState';

type SessionExerciseWithName = SessionExercise & { exercise_name: string };
type SetsByExercise = Record<string, WorkoutSet[]>;

const SetRow = memo(function SetRow({ setItem, onChange, onDelete }: { setItem: WorkoutSet; onChange: (next: WorkoutSet) => void; onDelete: (id: string) => void }) {
  return <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, gap: 8 }}>
    <Text style={{ fontWeight: '700' }}>Set {setItem.set_number}</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <TextInput value={String(setItem.reps ?? '')} onChangeText={(t) => onChange({ ...setItem, reps: t ? Number(t) : null })} keyboardType="numeric" placeholder="Reps" style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }} />
      <TextInput value={String(setItem.weight ?? '')} onChangeText={(t) => onChange({ ...setItem, weight: t ? Number(t) : null })} keyboardType="numeric" placeholder="Weight" style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }} />
      <TextInput value={String(setItem.rpe ?? '')} onChangeText={(t) => onChange({ ...setItem, rpe: t ? Number(t) : null })} keyboardType="numeric" placeholder="RPE" style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text>Warm-up</Text>
      <Switch value={setItem.is_warmup === 1} onValueChange={(value) => onChange({ ...setItem, is_warmup: value ? 1 : 0 })} />
    </View>
    <Pressable onPress={() => onDelete(setItem.id)} style={{ padding: 12, backgroundColor: '#ffeded', borderRadius: 10, alignItems: 'center' }}>
      <Text style={{ color: '#a00', fontWeight: '700' }}>Delete Set</Text>
    </Pressable>
  </View>;
});

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseWithName[]>([]);
  const [setsByExercise, setSetsByExercise] = useState<SetsByExercise>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = useMemo(() => id ?? '', [id]);

  const load = useCallback(() => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const foundSession = sessionRepo.findById(sessionId);
      const sessionExerciseRows = sessionRepo.listSessionExercisesWithExercise(sessionId);
      const setsMap = Object.fromEntries(sessionExerciseRows.map((row) => [row.id, setRepo.listBySessionExerciseId(row.id)]));
      setSession(foundSession);
      setAvailableExercises(exerciseRepo.list());
      setSessionExercises(sessionExerciseRows);
      setSetsByExercise(setsMap);
    } catch {
      setError('Failed to load session data.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const addExercise = useCallback((exerciseId: string) => {
    sessionRepo.attachExercise({ id: crypto.randomUUID(), session_id: sessionId, exercise_id: exerciseId, order_index: sessionExercises.length });
    load();
  }, [load, sessionExercises.length, sessionId]);

  const updateSet = useCallback((next: WorkoutSet) => {
    setRepo.update(next);
    setSetsByExercise((prev) => ({ ...prev, [next.session_exercise_id]: (prev[next.session_exercise_id] ?? []).map((s) => s.id === next.id ? next : s) }));
  }, []);

  const addSet = useCallback((sessionExerciseId: string) => {
    const current = setsByExercise[sessionExerciseId] ?? [];
    const nextSetNumber = current.length + 1;
    const created = setRepo.create({ id: crypto.randomUUID(), session_exercise_id: sessionExerciseId, set_number: nextSetNumber, reps: null, weight: null, rpe: null, is_warmup: 0 });
    setSetsByExercise((prev) => ({ ...prev, [sessionExerciseId]: [...(prev[sessionExerciseId] ?? []), created] }));
  }, [setsByExercise]);

  const repeatLastSet = useCallback((sessionExerciseId: string) => {
    const current = setsByExercise[sessionExerciseId] ?? [];
    if (current.length === 0) {
      addSet(sessionExerciseId);
      return;
    }
    const last = current[current.length - 1];
    const created = setRepo.create({ ...last, id: crypto.randomUUID(), set_number: last.set_number + 1 });
    setSetsByExercise((prev) => ({ ...prev, [sessionExerciseId]: [...(prev[sessionExerciseId] ?? []), created] }));
  }, [addSet, setsByExercise]);

  const deleteSet = useCallback((sessionExerciseId: string, setId: string) => {
    setRepo.remove(setId);
    const rows = (setsByExercise[sessionExerciseId] ?? []).filter((setItem) => setItem.id !== setId).map((setItem, index) => ({ ...setItem, set_number: index + 1 }));
    rows.forEach((row) => setRepo.update(row));
    setSetsByExercise((prev) => ({ ...prev, [sessionExerciseId]: rows }));
  }, [setsByExercise]);

  const endSession = useCallback(() => {
    sessionRepo.endSession(sessionId);
    load();
  }, [load, sessionId]);

  return <View style={{ flex: 1, padding: 16, gap: 10, backgroundColor: '#fff' }}>
    <Text style={{ fontSize: 24, fontWeight: '700' }}>Workout Session</Text>
    <LoadingErrorState loading={loading} error={error} />
    {session?.ended_at ? <Text style={{ color: '#0a6' }}>Ended: {new Date(session.ended_at).toLocaleString()}</Text> : null}

    <FlatList
      data={sessionExercises}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const sets = setsByExercise[item.id] ?? [];
        return <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#efefef', gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{index + 1}. {item.exercise_name}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => addSet(item.id)} style={{ flex: 1, backgroundColor: '#101820', padding: 14, borderRadius: 10, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '700' }}>Add Set</Text></Pressable>
            <Pressable onPress={() => repeatLastSet(item.id)} style={{ flex: 1, backgroundColor: '#25364a', padding: 14, borderRadius: 10, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '700' }}>Repeat Last Set</Text></Pressable>
          </View>
          <View style={{ gap: 8 }}>
            {sets.map((setItem) => <SetRow key={setItem.id} setItem={setItem} onChange={updateSet} onDelete={(setId) => deleteSet(item.id, setId)} />)}
          </View>
        </View>;
      }}
      ListEmptyComponent={<Text>Use the buttons below to add exercises.</Text>}
      ListFooterComponent={<View style={{ gap: 8, marginTop: 16 }}>
        {availableExercises.map((exercise) => (
          <Pressable key={exercise.id} onPress={() => addExercise(exercise.id)} style={{ backgroundColor: '#f3f3f3', padding: 14, borderRadius: 10 }}>
            <Text style={{ fontWeight: '700' }}>+ {exercise.name}</Text>
          </Pressable>
        ))}
        {!session?.ended_at ? <Pressable onPress={endSession} style={{ backgroundColor: '#0b7', padding: 16, borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '700' }}>End Session</Text></Pressable> : <Pressable onPress={() => router.push(`/session/${sessionId}/summary`)} style={{ backgroundColor: '#111', padding: 16, borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '700' }}>View Summary</Text></Pressable>}
      </View>}
    />

    {sessionExercises.length === 0 ? <Pressable onPress={() => {
      if (availableExercises.length === 0) {
        Alert.alert('No exercises', 'Create exercises from Settings > Exercises first.');
        return;
      }
      addExercise(availableExercises[0].id);
    }} style={{ backgroundColor: '#222', padding: 16, borderRadius: 10, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '700' }}>Add First Exercise</Text></Pressable> : null}
  </View>;
}
