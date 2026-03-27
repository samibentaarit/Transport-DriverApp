import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { palette } from "@/constants/theme";
import { TripStopInstance } from "@/types/models";
import { formatClock } from "@/utils/dates";

type StopRowProps = {
  stop: TripStopInstance;
  expectedStudents: number;
  onPress: () => void;
};

export function StopRow({ stop, expectedStudents, onPress }: StopRowProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.left}>
          <Text style={styles.title}>{stop.route_stop?.stop?.name ?? "Stop"}</Text>
          <Text style={styles.subtitle}>Planned {formatClock(stop.planned_arrival)} | Actual {formatClock(stop.actual_arrival)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.count}>{expectedStudents}</Text>
          <Text style={styles.countLabel}>students</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  left: {
    flex: 1
  },
  right: {
    alignItems: "flex-end"
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.ink
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: palette.slate
  },
  count: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.ocean
  },
  countLabel: {
    fontSize: 12,
    color: palette.slate
  }
});
