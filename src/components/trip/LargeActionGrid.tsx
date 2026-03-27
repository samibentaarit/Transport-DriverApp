import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { palette } from "@/constants/theme";

type TripAction = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

type LargeActionGridProps = {
  primary: TripAction[];
  secondary?: TripAction[];
};

export function LargeActionGrid({ primary, secondary = [] }: LargeActionGridProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Trip actions</Text>
      <View style={styles.grid}>
        {primary.map((action) => (
          <View key={action.label} style={styles.cell}>
            <Button label={action.label} onPress={action.onPress} variant={action.variant ?? "primary"} disabled={action.disabled} />
          </View>
        ))}
      </View>
      {secondary.length ? (
        <View style={styles.secondary}>
          {secondary.map((action) => (
            <Button key={action.label} label={action.label} onPress={action.onPress} variant={action.variant ?? "secondary"} disabled={action.disabled} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12
  },
  heading: {
    fontSize: 15,
    fontWeight: "800",
    color: palette.ink,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  cell: {
    width: "48%"
  },
  secondary: {
    gap: 10
  }
});

