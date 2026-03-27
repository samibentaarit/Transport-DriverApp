import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { palette } from "@/constants/theme";
import { StudentAssignment } from "@/types/models";
import { maskStudentName } from "@/utils/format";

type StudentRowProps = {
  assignment: StudentAssignment;
  onBoard: () => void;
  onMissed: () => void;
  onDropOff?: () => void;
};

export function StudentRow({ assignment, onBoard, onMissed, onDropOff }: StudentRowProps) {
  return (
    <Card style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{maskStudentName(assignment.student)}</Text>
        <Text style={styles.status}>Status: {assignment.status}</Text>
      </View>
      <View style={styles.actions}>
        <Button label={assignment.status === "boarded" ? "Drop off" : "Board"} onPress={assignment.status === "boarded" && onDropOff ? onDropOff : onBoard} variant="primary" />
        <Button label="Missed" onPress={onMissed} variant="ghost" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.ink
  },
  status: {
    marginTop: 4,
    fontSize: 13,
    color: palette.slate
  },
  actions: {
    gap: 10
  }
});

