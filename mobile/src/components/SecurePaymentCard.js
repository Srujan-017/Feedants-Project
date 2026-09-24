import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function SecurePaymentCard() {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="shield-checkmark-outline" size={18} color="#34d399" />
      </View>
      <View>
        <Text style={styles.title}>Secure Payments</Text>
        <Text style={styles.sub}>Powered by <Text style={styles.razorpay}>Razorpay</Text> · Visual only</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  icon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: 'rgba(52,211,153,0.15)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.30)', alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: fontSizes.base, fontWeight: '600' },
  sub: { color: colors.textMuted, fontSize: fontSizes.xs, marginTop: 2 },
  razorpay: { color: '#0069e0', fontWeight: '600' },
});
