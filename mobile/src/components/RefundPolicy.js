import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function RefundPolicy({ policy }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Refund Policy</Text>
      <Text style={styles.body}>{policy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.lg },
  label: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: spacing.sm },
  body: { color: colors.textMuted, fontSize: fontSizes.base, lineHeight: 20 },
});
