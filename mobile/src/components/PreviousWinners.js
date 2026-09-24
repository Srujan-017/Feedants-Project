import { View, Text, FlatList, StyleSheet } from 'react-native';
import WinnerCard from './WinnerCard';
import EmptyState from './EmptyState';
import { colors, spacing, fontSizes } from '../constants/theme';

export default function PreviousWinners({ winners }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Previous Winners</Text>
      {!winners || winners.length === 0 ? (
        <EmptyState message="No previous winners available." />
      ) : (
        <FlatList
          data={winners}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <WinnerCard winner={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg },
  sectionLabel: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
});
