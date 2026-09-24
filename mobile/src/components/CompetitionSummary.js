import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

function StatBox({ label, value, sub, highlight }) {
  return (
    <View style={[styles.box, highlight && styles.highlightBox]}>
      <Text style={[styles.label, highlight && { color: colors.primary }]}>{label}</Text>
      <Text style={[styles.value, highlight && { color: colors.primary }]}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

export default function CompetitionSummary({ competition }) {
  const { prizePool, entryFee, remainingSpots, bookedSpots, maxParticipants } = competition;
  return (
    <View style={styles.row}>
      <View style={styles.leftStats}>
        <StatBox label="Prize Pool" value={`₹${prizePool.toLocaleString('en-IN')}`} />
        <StatBox label="Entry Fee" value={`₹${entryFee}`} />
      </View>
      <StatBox label={`Only ${remainingSpots} spots left`} value={`${bookedSpots} / ${maxParticipants} Booked`} highlight />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: '#edf1f5', marginTop: spacing.lg },
  leftStats: { flex: 1, flexDirection: 'row', gap: spacing.xl },
  box: { flex: 1, gap: 4 },
  highlightBox: { alignItems: 'flex-end' },
  label: { color: colors.textMuted, fontSize: fontSizes.base, fontWeight: '500' },
  value: { color: colors.textPrimary, fontSize: fontSizes.xl, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: fontSizes.xs },
});
