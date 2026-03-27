import { Platform, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { palette } from "@/constants/theme";
import { TripLiveStatus } from "@/types/models";

type TripMapProps = {
  live?: TripLiveStatus | null;
};

function WebTripMap({ live }: TripMapProps) {
  const current = live?.current_location;
  const stops = live?.trip.stop_instances?.map((item) => item.route_stop?.stop).filter(Boolean) ?? [];

  return (
    <Card style={styles.card}>
      <View style={[styles.map, styles.webFallback]}>
        <Text style={styles.webTitle}>Map preview is disabled on web</Text>
        <Text style={styles.webText}>
          Use Android or iOS for the live vehicle map. Browser testing still supports trips, stops, boarding, queueing, and backend calls.
        </Text>
        {current ? (
          <Text style={styles.webMeta}>
            Current position: {current.lat.toFixed(5)}, {current.lng.toFixed(5)}
          </Text>
        ) : null}
        <Text style={styles.webMeta}>Stops loaded: {stops.length}</Text>
      </View>
    </Card>
  );
}

function NativeTripMap({ live }: TripMapProps) {
  const MapViewModule = require("react-native-maps") as typeof import("react-native-maps");
  const MapView = MapViewModule.default;
  const { Marker, Polyline } = MapViewModule;

  const stops = live?.trip.stop_instances?.map((item) => item.route_stop?.stop).filter(Boolean) ?? [];
  const coordinates = stops.map((stop) => ({
    latitude: stop!.lat,
    longitude: stop!.lng
  }));

  const center = live?.current_location
    ? {
        latitude: live.current_location.lat,
        longitude: live.current_location.lng
      }
    : coordinates[0];

  if (!center) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03
        }}
      >
        {coordinates.length > 1 ? <Polyline coordinates={coordinates} strokeWidth={4} /> : null}
        {coordinates.map((coordinate, index) => (
          <Marker key={`${coordinate.latitude}-${coordinate.longitude}`} coordinate={coordinate} title={`Stop ${index + 1}`} />
        ))}
        {live?.current_location ? (
          <Marker
            coordinate={{
              latitude: live.current_location.lat,
              longitude: live.current_location.lng
            }}
            title="Bus"
            pinColor="#1E5F8B"
          />
        ) : null}
      </MapView>
    </Card>
  );
}

export function TripMap({ live }: TripMapProps) {
  if (Platform.OS === "web") {
    return <WebTripMap live={live} />;
  }

  return <NativeTripMap live={live} />;
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden"
  },
  map: {
    height: 240,
    width: "100%"
  },
  webFallback: {
    padding: 20,
    backgroundColor: palette.sky,
    justifyContent: "center",
    gap: 8
  },
  webTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.ink
  },
  webText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.slate
  },
  webMeta: {
    fontSize: 13,
    color: palette.ink
  }
});
