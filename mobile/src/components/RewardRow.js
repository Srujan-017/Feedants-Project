import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../constants/theme';

const medalColor = (pos) => pos === 1 ? '#fbbf24' : pos === 2 ? '#9ca3af' : pos === 3 ? '#cd7f32' : colors.textMuted;

export default function RewardRow({ reward }) {
  const color = medalColor(reward.position);
  return (
    <View style={styles.row}>
      <View style={[styles.medal, { backgroundColor: color }]}>
        <Text style={styles.medalNum}>{reward.position}</Text>
      </View>
      <Text style={styles.label}>{reward.label}</Text>
      <Text style={[styles.amount, { color }]}>₹{reward.amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  medal: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  medalNum: { color: '#0d0d0f', fontSize: 11, fontWeight: '700' },
  label: { flex: 1, color: colors.textSecondary, fontSize: fontSizes.base },
  amount: { fontSize: fontSizes.md, fontWeight: '700' },
});
