import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

function Stars({ rating }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ color: i < rating ? colors.accent : colors.cardBorder, fontSize: 11 }}>★</Text>
      ))}
    </View>
  );
}

export default function TestimonialCard({ testimonial }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{testimonial.initials}</Text>
        </View>
        <View>
          <Text style={styles.name}>{testimonial.name}</Text>
          <Stars rating={testimonial.rating} />
        </View>
      </View>
      <Text style={styles.review}>{testimonial.review}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 190, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.lg, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#0d0d0f', fontSize: 11, fontWeight: '700' },
  name: { color: colors.textPrimary, fontSize: fontSizes.sm, fontWeight: '600' },
  stars: { flexDirection: 'row', gap: 1, marginTop: 2 },
  review: { color: colors.textMuted, fontSize: fontSizes.base, lineHeight: 18 },
});
