import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, radii } from '../constants/theme';

export default function UploadSubmissionButton({ active = false }) {
  const [msg, setMsg] = useState('');

  function handlePress() {
    if (active) {
      setMsg('Tap to select your submission video.');
    } else {
      setMsg('Submission upload will be available during the submission period.');
    }
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        disabled={!active}
        style={({ pressed }) => [
          styles.btn,
          !active && styles.btnInactive,
          pressed && active && { opacity: 0.7 },
        ]}
      >
        <Ionicons
          name="cloud-upload-outline"
          size={18}
          color={active ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.btnText, !active && styles.btnTextInactive]}>
          Upload Submission
        </Text>
      </Pressable>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  btn: {
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
  },
  btnInactive: {
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  btnText: { color: colors.primary, fontSize: fontSizes.md, fontWeight: '600' },
  btnTextInactive: { color: colors.textMuted },
  msg: {
    color: colors.textMuted,
    fontSize: fontSizes.base,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
