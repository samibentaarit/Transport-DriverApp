import { ActivityIndicator, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useNotifications } from "@/hooks/useNotifications";
import { backend } from "@/services/backend";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const notificationsQuery = useNotifications();

  return (
    <AppScreen
      title="Notifications"
      subtitle="Route changes, dispatcher alerts, and incident acknowledgements."
      rightAction={
        <Button
          label="Read all"
          variant="ghost"
          onPress={async () => {
            await backend.markAllNotificationsRead();
            await queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
          }}
        />
      }
    >
      {notificationsQuery.isLoading ? <ActivityIndicator /> : null}
      {notificationsQuery.data?.map((notification) => (
        <Card key={notification.id}>
          <Text style={{ fontSize: 16, fontWeight: "800" }}>{notification.title}</Text>
          <Text style={{ marginTop: 6, fontSize: 14 }}>{notification.body}</Text>
          <View style={{ marginTop: 12 }}>
            {!notification.read_at ? (
              <Button
                label="Mark read"
                variant="secondary"
                onPress={async () => {
                  await backend.markNotificationRead(notification.id);
                  await queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
                }}
              />
            ) : null}
          </View>
        </Card>
      ))}
      {!notificationsQuery.isLoading && !notificationsQuery.data?.length ? (
        <EmptyState title="All clear" description="New notifications will appear here as soon as the backend posts them." />
      ) : null}
    </AppScreen>
  );
}

