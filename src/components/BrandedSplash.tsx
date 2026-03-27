import { StyleSheet, Text, View } from "react-native";

import { palette } from "@/constants/theme";

export function BrandedSplash() {
  return (
    <View style={styles.container}>
      <View style={styles.circleLarge} />
      <View style={styles.circleSmall} />
      <View style={styles.card}>
        <Text style={styles.kicker}>Driver console</Text>
        <Text style={styles.title}>School Transport</Text>
        <Text style={styles.subtitle}>Trip controls, live tracking, and offline sync.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream,
    justifyContent: "center",
    padding: 24
  },
  circleLarge: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: palette.sand
  },
  circleSmall: {
    position: "absolute",
    bottom: 40,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: palette.sky
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: palette.ink,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 18
    },
    elevation: 8
  },
  kicker: {
    color: palette.ocean,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  title: {
    color: palette.ink,
    fontSize: 32,
    fontWeight: "800"
  },
  subtitle: {
    color: palette.slate,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12
  }
});

