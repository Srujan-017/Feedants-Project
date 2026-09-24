import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'judging', label: 'Judging' },
  { id: 'rules', label: 'Rules' },
];

function BulletList({ items }) {
  return items.map((item, i) => (
    <View key={i} style={styles.bulletRow}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{item}</Text>
    </View>
  ));
}

function NumberedList({ items }) {
  return items.map((item, i) => (
    <View key={i} style={styles.bulletRow}>
      <View style={styles.numBadge}><Text style={styles.numText}>{i + 1}</Text></View>
      <Text style={styles.bulletText}>{item}</Text>
    </View>
  ));
}

export default function CompetitionTabs({ activeTab, onTabChange, content }) {
  return (
    <View style={styles.section}>
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilitySelected={activeTab === tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'about' && (
          <View>
            <Text style={styles.heading}>About Competition</Text>
            {content.aboutCompetition.map((p, i) => (
              <Text key={i} style={styles.para}>{p}</Text>
            ))}
          </View>
        )}
        {activeTab === 'judging' && (
          <View>
            <Text style={styles.heading}>Judging Parameters</Text>
            <BulletList items={content.judgingParameters} />
          </View>
        )}
        {activeTab === 'rules' && (
          <View>
            <Text style={styles.heading}>Rules</Text>
            <NumberedList items={content.rules} />
            <Text style={[styles.heading, { marginTop: spacing.xl }]}>Eligibility</Text>
            <BulletList items={content.eligibility} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  tabBar: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSizes.sm, fontWeight: '600' },
  activeTabText: { color: '#0d0d0f' },
  content: { marginTop: spacing.md, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.lg },
  heading: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '600', marginBottom: spacing.sm },
  para: { color: colors.textSecondary, fontSize: fontSizes.base, lineHeight: 20, marginTop: spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 7 },
  bulletText: { flex: 1, color: colors.textSecondary, fontSize: fontSizes.base, lineHeight: 20 },
  numBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  numText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
});
