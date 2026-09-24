import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../constants/theme';

const ITEMS = [
  { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'competitions', label: 'Compete', icon: 'trophy-outline', activeIcon: 'trophy' },
  { id: 'refer', label: 'Refer', icon: 'share-social-outline', activeIcon: 'share-social' },
  { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function BottomNavigation({ active, onChange }) {
  return (
    <View style={styles.nav}>
      {ITEMS.map(item => {
        const isActive = active === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            style={styles.item}
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={22}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  item: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, gap: 3 },
  label: { color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: '500' },
  activeLabel: { color: colors.primary },
});
