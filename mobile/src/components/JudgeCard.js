import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function JudgeCard({ judge }) {
  const [showMsg, setShowMsg] = useState(false);
  if (!judge) return null;
  const initials = judge.name.split(' ').map(w => w[0]).join('').toUpperCase();
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Judge</Text>
      <View style={styles.row}>
        <View style={styles.avatar}>
          {judge.imageUrl ? <Image source={{ uri: judge.imageUrl }} style={styles.avatarImage} /> : <Text style={styles.initials}>{initials}</Text>}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{judge.name}</Text>
          <Text style={styles.profession}>{judge.profession}</Text>
          <Text style={styles.experience}>{judge.experience}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Pressable
        onPress={() => setShowMsg(v => !v)}
        accessibilityRole="button"
        accessibilityLabel="Watch intro video"
        style={({ pressed }) => [styles.videoBtn, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.playIcon}>
          <Ionicons name="play" size={10} color={colors.primary} />
        </View>
        <Text style={styles.videoBtnText}>Intro Video</Text>
      </Pressable>
      {showMsg && <Text style={styles.msg}>Intro video will be available soon.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden' },
  sectionLabel: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  avatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  initials: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: colors.textPrimary, fontSize: fontSizes.md, fontWeight: '600' },
  profession: { color: colors.textMuted, fontSize: fontSizes.base },
  experience: { color: colors.primary, fontSize: fontSizes.base, fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.cardBorder },
  videoBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  playIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center' },
  videoBtnText: { color: colors.primary, fontSize: fontSizes.base, fontWeight: '600' },
  msg: { color: colors.textMuted, fontSize: fontSizes.base, fontStyle: 'italic', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
