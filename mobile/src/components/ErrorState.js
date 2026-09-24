import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii } from '../constants/theme';

export default function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Unable to load competition.</Text>
      <Text style={styles.sub}>{message || 'Please check your connection and try again.'}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  icon: { fontSize: 40 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  button: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: '#0d0d0f', fontWeight: '700', fontSize: 14 },
});
