import { Platform, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { palette } from "@/constants/theme";
import { env } from "@/services/env";
import { TripLiveStatus } from "@/types/models";

type TripMapProps = {
  live?: TripLiveStatus | null;
};

function toFiniteNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidCoordinate(latitude: number, longitude: number) {
  const inRange = latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  const isZeroPair = latitude === 0 && longitude === 0;
  return inRange && !isZeroPair;
}

function WebTripMap({ live }: TripMapProps) {
  const current = live?.current_location;
  const currentLat = toFiniteNumber(current?.lat);
  const currentLng = toFiniteNumber(current?.lng);
  const stops = live?.trip.stop_instances?.map((item) => item.route_stop?.stop).filter(Boolean) ?? [];

  return (
    <Card style={styles.card}>
      <View style={[styles.map, styles.webFallback]}>
        <Text style={styles.webTitle}>Map preview is disabled on web</Text>
        <Text style={styles.webText}>
          Use Android or iOS for the live vehicle map. Browser testing still supports trips, stops, boarding, queueing, and backend calls.
        </Text>
        {currentLat != null && currentLng != null ? (
          <Text style={styles.webMeta}>
            Current position: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </Text>
        ) : null}
        <Text style={styles.webMeta}>Stops loaded: {stops.length}</Text>
      </View>
    </Card>
  );
}

function NativeTripMap({ live }: TripMapProps) {
  let MapboxModule: typeof import("@rnmapbox/maps");
  try {
    MapboxModule = require("@rnmapbox/maps") as typeof import("@rnmapbox/maps");
  } catch {
    return (
      <Card style={styles.card}>
        <View style={[styles.map, styles.webFallback]}>
          <Text style={styles.webTitle}>Map module unavailable in this build</Text>
          <Text style={styles.webText}>Install a development build with RNMapbox native support, then reopen the app.</Text>
        </View>
      </Card>
    );
  }

  const { default: Mapbox, MapView, Camera, ShapeSource, LineLayer, PointAnnotation } = MapboxModule;
  const mapboxStyleId = env.mapboxStyleId;
  const mapboxAccessToken = env.mapboxAccessToken;
  const canRenderMapbox = Boolean(mapboxAccessToken);
  const mapboxStyleUrl = mapboxStyleId.startsWith("mapbox://styles/")
    ? mapboxStyleId
    : `mapbox://styles/${mapboxStyleId}`;

  if (!canRenderMapbox) {
    return (
      <Card style={styles.card}>
        <View style={[styles.map, styles.webFallback]}>
          <Text style={styles.webTitle}>Mapbox configuration missing</Text>
          <Text style={styles.webText}>Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in .env and restart Expo.</Text>
        </View>
      </Card>
    );
  }

  const stops = live?.trip.stop_instances?.map((item) => item.route_stop?.stop).filter(Boolean) ?? [];
  const markerStops = stops
    .map((stop, index) => {
      const latitude = toFiniteNumber(stop?.lat);
      const longitude = toFiniteNumber(stop?.lng);
      if (latitude == null || longitude == null) {
        return null;
      }

      if (!isValidCoordinate(latitude, longitude)) {
        return null;
      }

      return {
        key: stop?.id ? String(stop.id) : `stop-${index}`,
        title: stop?.name ? String(stop.name) : `Stop ${index + 1}`,
        latitude,
        longitude
      };
    })
    .filter(
      (stop): stop is { key: string; title: string; latitude: number; longitude: number } => stop !== null
    );

  const coordinates = markerStops.map((stop) => ({
    latitude: stop.latitude,
    longitude: stop.longitude
  }));
  const lineCoordinates = markerStops.map((stop) => [stop.longitude, stop.latitude] as [number, number]);

  const liveLatitude = toFiniteNumber(live?.current_location?.lat);
  const liveLongitude = toFiniteNumber(live?.current_location?.lng);

  const hasLiveCoordinate =
    liveLatitude != null &&
    liveLongitude != null &&
    isValidCoordinate(liveLatitude, liveLongitude);

  const center = hasLiveCoordinate
    ? {
        latitude: liveLatitude,
        longitude: liveLongitude
      }
    : coordinates[0];

  if (!center) {
    return (
      <Card style={styles.card}>
        <View style={[styles.map, styles.webFallback]}>
          <Text style={styles.webTitle}>Waiting for valid map coordinates</Text>
          <Text style={styles.webText}>Trip map will appear after the backend sends stop or live GPS coordinates.</Text>
        </View>
      </Card>
    );
  }

  Mapbox.setAccessToken(mapboxAccessToken);

  return (
    <Card style={styles.card}>
      <MapView style={styles.map} styleURL={mapboxStyleUrl} logoEnabled={false} attributionEnabled={false}>
        <Camera
          centerCoordinate={[center.longitude, center.latitude]}
          zoomLevel={13}
          animationMode="flyTo"
          animationDuration={500}
        />

        {lineCoordinates.length > 1 ? (
          <ShapeSource
            id="route-line"
            shape={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: lineCoordinates
              }
            }}
          >
            <LineLayer
              id="route-line-layer"
              style={{
                lineColor: "#1E5F8B",
                lineWidth: 4,
                lineCap: "round",
                lineJoin: "round"
              }}
            />
          </ShapeSource>
        ) : null}

        {markerStops.map((stop, index) => (
          <PointAnnotation key={`${stop.key}-${index}`} id={`stop-${stop.key}-${index}`} coordinate={[stop.longitude, stop.latitude]}>
            <View style={styles.stopMarker} />
          </PointAnnotation>
        ))}

        {hasLiveCoordinate ? (
          <PointAnnotation id="bus-location" coordinate={[liveLongitude, liveLatitude]}>
            <View style={styles.busMarker} />
          </PointAnnotation>
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
  },
  stopMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  busMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1E5F8B",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  }
});
