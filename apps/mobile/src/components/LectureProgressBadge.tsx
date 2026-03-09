import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { LectureProgressStatus } from "../hooks/useLectureProgress";

type LectureProgressBadgeProps = {
  status: LectureProgressStatus;
};

function getStatusLabel(status: LectureProgressStatus): string {
  if (status === "completed") {
    return "Завершена";
  }

  if (status === "in-progress") {
    return "В процессе";
  }

  return "Не начата";
}

export function LectureProgressBadge({
  status,
}: LectureProgressBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        status === "completed"
          ? styles.badgeCompleted
          : status === "in-progress"
            ? styles.badgeInProgress
            : styles.badgeNotStarted,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          status === "completed"
            ? styles.badgeTextCompleted
            : status === "in-progress"
              ? styles.badgeTextInProgress
              : styles.badgeTextNotStarted,
        ]}
      >
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

export default LectureProgressBadge;

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  badgeCompleted: {
    backgroundColor: "#ecfdf3",
    borderColor: "#a6f4c5",
  },
  badgeInProgress: {
    backgroundColor: "#eff8ff",
    borderColor: "#b2ddff",
  },
  badgeNotStarted: {
    backgroundColor: "#f9fafb",
    borderColor: "#d0d5dd",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  badgeTextCompleted: {
    color: "#067647",
  },
  badgeTextInProgress: {
    color: "#175cd3",
  },
  badgeTextNotStarted: {
    color: "#344054",
  },
});