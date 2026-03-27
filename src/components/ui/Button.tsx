import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { palette, radius } from "@/constants/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = "primary", disabled, loading }: ButtonProps) {
  const style = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "danger" && styles.danger,
    variant === "ghost" && styles.ghost,
    disabled && styles.disabled
  ];

  const textStyle = [
    styles.label,
    variant === "secondary" && styles.secondaryLabel,
    variant === "ghost" && styles.secondaryLabel
  ];

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={style}>
      {loading ? <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? palette.ink : palette.white} /> : <Text style={textStyle}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: palette.ocean
  },
  secondary: {
    backgroundColor: palette.sand
  },
  danger: {
    backgroundColor: palette.danger
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D3C0A2"
  },
  disabled: {
    opacity: 0.6
  },
  label: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryLabel: {
    color: palette.ink
  }
});

