import { ActivityIndicator, Text } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMessages } from "@/hooks/useMessages";

export default function MessagesScreen() {
  const messagesQuery = useMessages();

  return (
    <AppScreen title="Messages" subtitle="Operational dispatcher communication only.">
      {messagesQuery.isLoading ? <ActivityIndicator /> : null}
      {messagesQuery.data?.map((message) => (
        <Card key={message.id}>
          <Text style={{ fontSize: 16, fontWeight: "800" }}>{message.subject ?? "Dispatcher"}</Text>
          <Text style={{ marginTop: 6, fontSize: 14 }}>{message.body}</Text>
          <Text style={{ marginTop: 10, fontSize: 12 }}>{message.sender_name}</Text>
        </Card>
      ))}
      {!messagesQuery.isLoading && !messagesQuery.data?.length ? (
        <EmptyState title="No messages" description="The current Laravel backend does not expose a dedicated messages endpoint, so this screen stays empty unless one is configured in `.env`." />
      ) : null}
    </AppScreen>
  );
}

