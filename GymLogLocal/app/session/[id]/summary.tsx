import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import { setRepo } from '@/db/repositories/setRepo';

export default function SessionSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = sessionRepo.findById(id ?? '');
  const exercises = sessionRepo.listSessionExercisesWithExercise(id ?? '');

  return <View style={{ flex: 1, padding: 16, gap: 12 }}>
    <Text style={{ fontSize: 24, fontWeight: '700' }}>Session Summary</Text>
    {!session ? <Text>Session not found.</Text> : <>
      <Text>Date: {dayjs(session.started_at).format('MMM D, YYYY h:mm A')}</Text>
      <Text>Ended: {session.ended_at ? dayjs(session.ended_at).format('MMM D, YYYY h:mm A') : 'In progress'}</Text>
      {exercises.map((exercise, idx) => {
        const sets = setRepo.listBySessionExerciseId(exercise.id);
        return <View key={exercise.id} style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 10, gap: 6 }}>
          <Text style={{ fontWeight: '700' }}>{idx + 1}. {exercise.exercise_name}</Text>
          {sets.map((setItem) => <Text key={setItem.id}>Set {setItem.set_number}: {setItem.reps ?? '-'} reps @ {setItem.weight ?? '-'} ({setItem.rpe ?? '-'} RPE){setItem.is_warmup ? ' [Warm-up]' : ''}</Text>)}
        </View>;
      })}
    </>}
  </View>;
}
