import { useEffect } from 'react';
import { Dimensions, ScrollView, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { buildWeeklyCounts } from '@/features/progress/selectors';
import { useSessionStore } from '@/features/sessions/store';

export default function ProgressScreen() {
  const { sessions, loadSessions } = useSessionStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const chart = buildWeeklyCounts(sessions);
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16 }}>Progress</Text>
      <LineChart
        data={{ labels: chart.labels, datasets: [{ data: chart.data.length ? chart.data : [0] }] }}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisInterval={1}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          labelColor: () => '#111',
        }}
        bezier
      />
    </ScrollView>
  );
}
