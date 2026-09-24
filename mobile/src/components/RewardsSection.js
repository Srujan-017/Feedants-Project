import { View, Text, StyleSheet } from 'react-native';
import RewardRow from './RewardRow';
import EmptyState from './EmptyState';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function RewardsSection({ rewards }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Rewards</Text>
      {!rewards || rewards.length === 0 ? (
        <EmptyState message="No rewards listed." />
      ) : (
        rewards.map(r => <RewardRow key={r.position} reward={r} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  sectionLabel: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', paddingVertical: spacing.sm },
});
