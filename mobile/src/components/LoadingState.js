import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Loading competition...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
