import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function EmptyState({ message = 'No data available.' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  text: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
});
