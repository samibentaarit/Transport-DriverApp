import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { palette, radius } from "@/constants/theme";

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: palette.ink,
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowRadius: 22,
    elevation: 3
  }
});

