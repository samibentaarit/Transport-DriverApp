import { Alert, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { syncOfflineQueue } from "@/offline/queueSync";
import { useQueueStore } from "@/offline/queueStore";

export default function QueueScreen() {
  const items = useQueueStore((state) => state.items);
  const meta = useQueueStore((state) => state.meta);
  const clear = useQueueStore((state) => state.clear);

  return (
    <AppScreen title="Offline queue" subtitle="Queued actions are replayed in order once connectivity returns.">
      <Card style={styles.card}>
        <Text>Pending items: {items.length}</Text>
        <Text>Last sync: {meta.lastSyncAt ?? "Never"}</Text>
        <Text>Last error: {meta.lastError ?? "None"}</Text>
      </Card>

      <Button
        label="Sync now"
        onPress={async () => {
          try {
            await syncOfflineQueue();
          } catch (error) {
            Alert.alert("Sync failed", error instanceof Error ? error.message : "Unable to sync queue.");
          }
        }}
      />

      <Button label="Clear queue" variant="ghost" onPress={() => void clear()} />

      <View style={styles.list}>
        {items.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Text style={styles.itemType}>{item.type}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Retries: {item.retries}</Text>
            <Text>Created: {item.createdAt}</Text>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8
  },
  list: {
    gap: 12
  },
  itemType: {
    fontSize: 16,
    fontWeight: "800"
  }
});
