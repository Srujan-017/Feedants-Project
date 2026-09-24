import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function RegistrationButton({ registered, status, entryFee, onRegister, loading = false }) {
  if (registered) {
    return (
      <View style={[styles.base, styles.registered]}>
        <Text style={styles.registeredText}>✓ You are Registered!</Text>
      </View>
    );
  }
  if (status === 'REGISTRATION_CLOSED') {
    return <View style={[styles.base, styles.closed]}><Text style={styles.closedText}>Registration Closed</Text></View>;
  }
  if (status === 'SUBMISSION_OPEN') {
    return <View style={[styles.base, styles.closed]}><Text style={styles.closedText}>Registration has closed</Text></View>;
  }
  if (status === 'RESULTS_PUBLISHED') {
    return <View style={[styles.base, styles.results]}><Text style={styles.resultsText}>Results Published</Text></View>;
  }
  if (status === 'UPCOMING') {
    return <View style={[styles.base, styles.closed]}><Text style={styles.closedText}>Coming Soon</Text></View>;
  }
  return (
    <Pressable
      onPress={onRegister}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Register for competition"
      style={({ pressed }) => [styles.base, styles.open, (pressed || loading) && { opacity: 0.7 }]}
    >
      <Text style={styles.primaryText}>{loading ? 'Registering...' : `Register Now - ₹${entryFee}`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { marginHorizontal: spacing.lg, marginTop: spacing.lg, paddingVertical: 14, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center' },
  open: { backgroundColor: colors.primary },
  registered: { backgroundColor: colors.successLight, borderWidth: 1, borderColor: colors.successBorder },
  closed: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  results: { backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.accentBorder },
  primaryText: { color: '#fff', fontSize: fontSizes.md, fontWeight: '700' },
  registeredText: { color: colors.success, fontSize: fontSizes.md, fontWeight: '600' },
  closedText: { color: colors.textMuted, fontSize: fontSizes.md, fontWeight: '600' },
  resultsText: { color: colors.accent, fontSize: fontSizes.md, fontWeight: '600' },
});
