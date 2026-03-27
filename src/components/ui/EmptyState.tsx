import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { palette } from "@/constants/theme";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 18,
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.ink
  },
  description: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: palette.slate
  }
});

