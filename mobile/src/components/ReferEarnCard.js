import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function ReferEarnCard() {
  const [clicked, setClicked] = useState(false);
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="people-outline" size={18} color={colors.accent} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>Refer &amp; Earn</Text>
        <Text style={styles.sub}>Invite friends and earn rewards when they compete.</Text>
        <Pressable
          onPress={() => setClicked(true)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.btnText}>{clicked ? 'Coming Soon 🎉' : 'Refer Now'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.accentBorder, backgroundColor: colors.accentLight, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  icon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: 'rgba(251,191,36,0.2)', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: spacing.sm },
  title: { color: colors.accent, fontSize: fontSizes.md, fontWeight: '700' },
  sub: { color: colors.textSecondary, fontSize: fontSizes.base },
  btn: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full, backgroundColor: 'rgba(251,191,36,0.2)', borderWidth: 1, borderColor: colors.accentBorder },
  btnText: { color: colors.accent, fontSize: fontSizes.sm, fontWeight: '600' },
});
