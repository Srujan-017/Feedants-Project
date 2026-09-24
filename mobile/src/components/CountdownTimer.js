import { View, Text, StyleSheet } from 'react-native';
import { useCountdown } from '../hooks/useCountdown';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

function pad(n) { return String(n).padStart(2, '0'); }

function Unit({ value, label }) {
  return (
    <View style={styles.unitWrap}>
      <View style={styles.box}>
        <Text style={styles.num}>{pad(value)}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export default function CountdownTimer({ deadline }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(deadline);
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Registration closes in</Text>
      {expired ? (
        <Text style={styles.expired}>Registration has ended</Text>
      ) : (
        <View style={styles.row}>
          <Unit value={days} label="Days" />
          <Text style={styles.sep}>:</Text>
          <Unit value={hours} label="Hours" />
          <Text style={styles.sep}>:</Text>
          <Unit value={minutes} label="Mins" />
          <Text style={styles.sep}>:</Text>
          <Unit value={seconds} label="Secs" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.lg },
  sectionLabel: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  unitWrap: { alignItems: 'center', gap: 4 },
  box: { minWidth: 52, height: 56, backgroundColor: colors.muted, borderRadius: radii.md, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  num: { color: colors.primary, fontSize: fontSizes.xxl, fontWeight: '700' },
  label: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', fontWeight: '500' },
  sep: { color: colors.primary, fontSize: 20, fontWeight: '700', marginBottom: 20 },
  expired: { color: '#f87171', fontSize: fontSizes.md, fontWeight: '600' },
});
