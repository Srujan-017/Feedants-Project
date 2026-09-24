import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function CompetitionBadges({ category, type }) {
  return (
    <View style={styles.row}>
      <View style={[styles.badge, styles.teal]}>
        <Ionicons name="trophy-outline" size={12} color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary }]}>{category}</Text>
      </View>
      <View style={[styles.badge, styles.neutral]}>
        <Text style={[styles.text, { color: colors.textPrimary }]}>{type}</Text>
      </View>
      <View style={styles.certificate}>
        <Ionicons name="trophy-outline" size={15} color={colors.primary} />
        <Text style={styles.certificateText}>Winners get certificate</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1 },
  text: { fontSize: fontSizes.xs, fontWeight: '600' },
  teal: { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder },
  neutral: { backgroundColor: '#f3f5fa', borderColor: '#edf0f5' },
  certificate: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 2 },
  certificateText: { color: colors.primary, fontSize: fontSizes.sm, fontWeight: '600' },
});
