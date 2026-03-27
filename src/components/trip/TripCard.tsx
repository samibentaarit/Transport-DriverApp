import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { palette } from "@/constants/theme";
import { Trip } from "@/types/models";
import { formatClock } from "@/utils/dates";
import { expectedCount } from "@/utils/trips";
import { formatVehicleLabel, tripStatusTone } from "@/utils/format";

type TripCardProps = {
  trip: Trip;
  locale?: string;
  onPress: () => void;
};

export function TripCard({ trip, locale = "en", onPress }: TripCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.route}>{trip.route?.name ?? "Assigned route"}</Text>
            <Text style={styles.vehicle}>{formatVehicleLabel(trip.vehicle?.name, trip.vehicle?.license_plate)}</Text>
          </View>
          <Badge label={trip.status} tone={tripStatusTone(trip.status)} />
        </View>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.metaLabel}>Departure</Text>
            <Text style={styles.metaValue}>{formatClock(trip.scheduled_start, locale)}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Expected</Text>
            <Text style={styles.metaValue}>{expectedCount(trip.student_assignments)} students</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    gap: 12
  },
  route: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.ink
  },
  vehicle: {
    marginTop: 6,
    fontSize: 14,
    color: palette.slate
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18
  },
  metaLabel: {
    fontSize: 12,
    color: palette.slate,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  metaValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: palette.ink
  }
});

