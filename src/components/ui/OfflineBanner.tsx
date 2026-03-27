import { StyleSheet, Text, View } from "react-native";

import { useQueueStore } from "@/offline/queueStore";
import { palette, radius } from "@/constants/theme";
import { useNetworkStore } from "@/store/networkStore";

export function OfflineBanner() {
  const isOnline = useNetworkStore((state) => state.isOnline && state.isReachable);
  const queueLength = useQueueStore((state) => state.items.length);

  if (isOnline && queueLength === 0) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{isOnline ? "Sync pending" : "Offline mode"}</Text>
      <Text style={styles.subtitle}>
        {isOnline ? `${queueLength} action(s) waiting to sync.` : "Trip actions will queue and sync when the connection returns."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FCE8C9",
    borderRadius: radius.md,
    padding: 14
  },
  title: {
    color: palette.warning,
    fontWeight: "800",
    fontSize: 14
  },
  subtitle: {
    color: "#7E5D25",
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18
  }
});
