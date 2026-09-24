import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function DisclaimerSection({ disclaimer, refundPolicy }) {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <Text style={styles.label}>Disclaimer</Text>
        <Text style={styles.body}>{disclaimer}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Refund Policy</Text>
        <Text style={styles.body}>{refundPolicy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.lg },
  label: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: spacing.sm },
  body: { color: colors.textMuted, fontSize: fontSizes.base, lineHeight: 20 },
});
