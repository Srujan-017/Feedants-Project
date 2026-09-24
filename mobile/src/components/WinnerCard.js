import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

const medalColor = (pos) => pos === 1 ? '#fbbf24' : pos === 2 ? '#9ca3af' : pos === 3 ? '#cd7f32' : colors.textMuted;
const posLabel = (pos) => { const s = ['th','st','nd','rd']; const v = pos % 100; return pos + (s[(v-20)%10]||s[v]||s[0]) + ' Winner'; };

export default function WinnerCard({ winner }) {
  if (!winner) return null;
  const initials = winner.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const color = medalColor(winner.position);
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { borderColor: color, backgroundColor: `${color}22` }]}>
          {winner.imageUrl ? <Image source={{ uri: winner.imageUrl }} style={styles.image} /> : <Text style={[styles.initials, { color }]}>{initials}</Text>}
        </View>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeNum}>{winner.position}</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>{winner.name}</Text>
      <Text style={[styles.pos, { color }]}>{posLabel(winner.position)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 110, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.md, alignItems: 'center', gap: spacing.sm },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  initials: { fontSize: fontSizes.lg, fontWeight: '700' },
  badge: { position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeNum: { color: '#0d0d0f', fontSize: 9, fontWeight: '700' },
  name: { color: colors.textPrimary, fontSize: fontSizes.sm, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  pos: { fontSize: fontSizes.xs, fontWeight: '500', textAlign: 'center' },
});
