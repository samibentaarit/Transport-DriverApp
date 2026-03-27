import { Modal, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { palette } from "@/constants/theme";

type EmergencyModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function EmergencyModal({ visible, onCancel, onConfirm }: EmergencyModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <Card style={styles.card}>
          <Text style={styles.title}>Send emergency alert?</Text>
          <Text style={styles.body}>
            This will create a critical alert with your current location and notify dispatch immediately.
          </Text>
          <View style={styles.actions}>
            <Button label="Cancel" onPress={onCancel} variant="ghost" />
            <Button label="Send alert" onPress={onConfirm} variant="danger" />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(9,17,26,0.48)",
    justifyContent: "center",
    padding: 24
  },
  card: {
    gap: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.ink
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.slate
  },
  actions: {
    gap: 10
  }
});
