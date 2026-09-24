import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../constants/theme';

export default function Header({ registered, onBack, language, onLanguageChange }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack ?? (() => {})}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.title}>Go back</Text>
      <View style={styles.languageControl}>
        {[['en', 'ENG'], ['hi', 'हिंदी']].map(([value, label]) => (
          <Pressable key={value} onPress={() => onLanguageChange(value)} style={[styles.language, language === value && styles.languageActive]}>
            <Text style={[styles.languageText, language === value && styles.languageTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {registered && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Registered</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    minHeight: 52,
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  languageControl: { flexDirection: 'row', backgroundColor: '#eef2f6', borderRadius: 18, padding: 2 },
  language: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  languageActive: { backgroundColor: colors.primary },
  languageText: { color: colors.textMuted, fontSize: fontSizes.sm, fontWeight: '700' },
  languageTextActive: { color: '#ffffff' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  badgeText: { color: colors.success, fontSize: fontSizes.xs, fontWeight: '700' },
});
