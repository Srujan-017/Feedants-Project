import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function LanguageSelector({ selected, onChange }) {
  return (
    <View style={styles.container}>
      {[{ id: 'en', label: 'ENG' }, { id: 'hi', label: 'हिंदी' }].map((lang, i) => (
        <Pressable
          key={lang.id}
          onPress={() => onChange(lang.id)}
          accessibilityRole="button"
          accessibilityLabel={lang.label}
          style={[styles.btn, selected === lang.id && styles.active, i === 0 && styles.left, i === 1 && styles.right]}
        >
          <Text style={[styles.text, selected === lang.id && styles.activeText]}>{lang.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.md, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card, alignSelf: 'flex-start' },
  btn: { paddingHorizontal: 16, paddingVertical: 8 },
  left: { borderTopLeftRadius: radii.lg, borderBottomLeftRadius: radii.lg },
  right: { borderTopRightRadius: radii.lg, borderBottomRightRadius: radii.lg },
  active: { backgroundColor: colors.primary },
  text: { color: colors.textMuted, fontSize: fontSizes.sm, fontWeight: '600' },
  activeText: { color: '#0d0d0f' },
});
