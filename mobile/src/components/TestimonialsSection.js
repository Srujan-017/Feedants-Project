import { View, Text, FlatList, StyleSheet } from 'react-native';
import TestimonialCard from './TestimonialCard';
import { colors, spacing, fontSizes } from '../constants/theme';

export default function TestimonialsSection({ testimonials }) {
  if (!testimonials || testimonials.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Hear From Our Users</Text>
      <FlatList
        data={testimonials}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TestimonialCard testimonial={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg },
  label: { color: colors.textMuted, fontSize: fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
});
