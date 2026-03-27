import { StyleSheet, Text, View } from "react-native";

import { palette, radius } from "@/constants/theme";

type BadgeProps = {
  label: string;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
};

const backgrounds = {
  primary: "#D9EEF8",
  success: "#DDF4E7",
  warning: "#FCE8C9",
  danger: "#F8DBD6",
  neutral: "#E8EDF2"
};

const colors = {
  primary: palette.ocean,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  neutral: palette.slate
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: backgrounds[tone] }]}>
      <Text style={[styles.label, { color: colors[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start"
  },
  label: {
    fontSize: 12,
    fontWeight: "700"
  }
});

