import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { palette, spacing } from "@/constants/theme";

type AppScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  scroll?: boolean;
}>;

export function AppScreen({ children, title, subtitle, rightAction, scroll = true }: AppScreenProps) {
  const content = (
    <View style={styles.content}>
      <OfflineBanner />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction}
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.cream
  },
  scroll: {
    paddingBottom: spacing.xxl
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.ink
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: palette.slate
  }
});

