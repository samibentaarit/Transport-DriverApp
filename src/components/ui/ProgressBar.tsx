import { StyleSheet, View } from "react-native";

import { palette, radius } from "@/constants/theme";

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    backgroundColor: "#E6D9C5",
    borderRadius: radius.pill,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    backgroundColor: palette.ocean,
    borderRadius: radius.pill
  }
});

