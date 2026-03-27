import { StyleSheet, Text, TextInput, View } from "react-native";

import { palette, radius } from "@/constants/theme";

type InputFieldProps = {
  label: string;
  value?: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  multiline?: boolean;
  error?: string;
  placeholder?: string;
};

export function InputField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  multiline,
  error,
  placeholder
}: InputFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        placeholder={placeholder}
        placeholderTextColor="#8294A4"
        style={[styles.input, multiline && styles.multiline, error && styles.errorInput]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.ink
  },
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#D7C5A8",
    paddingHorizontal: 16,
    color: palette.ink,
    fontSize: 16
  },
  multiline: {
    minHeight: 110,
    paddingVertical: 14,
    textAlignVertical: "top"
  },
  errorInput: {
    borderColor: palette.danger
  },
  error: {
    color: palette.danger,
    fontSize: 12,
    fontWeight: "600"
  }
});

