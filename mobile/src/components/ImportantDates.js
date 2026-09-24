import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DateRow({ label, date, accent }) {
  return (
    <View style={styles.row}>
      <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.date, accent && { color: colors.primary }]}>{fmt(date)}</Text>
    </View>
  );
}

export default function ImportantDates({ dates }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Important Dates</Text>
      <DateRow label="Register Before" date={dates.registrationDeadline} accent />
      <DateRow label="Submission Starts" date={dates.submissionStart} />
      <DateRow label="Submission Ends" date={dates.submissionEnd} />
      <DateRow label="Result Date" date={dates.resultDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  sectionLabel: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  label: { flex: 1, color: colors.textMuted, fontSize: fontSizes.base },
  date: { color: colors.textPrimary, fontSize: fontSizes.base, fontWeight: '600' },
});
