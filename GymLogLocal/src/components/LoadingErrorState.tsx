import { ActivityIndicator, Text, View } from 'react-native';

type Props = {
  loading: boolean;
  error: string | null;
};

export function LoadingErrorState({ loading, error }: Props) {
  if (loading) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return null;
}
