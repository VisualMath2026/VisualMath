import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import FavoriteButton from "./FavoriteButton";
import LectureProgressBadge from "./LectureProgressBadge";
import type { LectureSummary } from "../features/lectures/types";
import type { LectureProgressStatus } from "../hooks/useLectureProgress";
import { formatDateTime } from "../utils/formatDateTime";

type LectureListCardProps = {
  item: LectureSummary;
  isFavorite: boolean;
  progressStatus: LectureProgressStatus;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export function LectureListCard({
  item,
  isFavorite,
  progressStatus,
  onPress,
  onToggleFavorite,
}: LectureListCardProps) {
  const updatedAtLabel = formatDateTime(item.updatedAt);

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.cardMain}>
        <View style={styles.topRow}>
          <LectureProgressBadge status={progressStatus} />
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>

        <Text style={styles.cardDescription}>
          {item.description?.trim() || "Описание пока не добавлено"}
        </Text>

        <View style={styles.metaRow}>
          {item.subject ? (
            <Text style={styles.metaText}>Предмет: {item.subject}</Text>
          ) : null}

          {item.author ? (
            <Text style={styles.metaText}>Автор: {item.author}</Text>
          ) : null}
        </View>

        {updatedAtLabel ? (
          <Text style={styles.cardUpdatedAt}>Обновлено: {updatedAtLabel}</Text>
        ) : null}
      </Pressable>

      <View style={styles.cardFavorite}>
        <FavoriteButton
          isFavorite={isFavorite}
          onPress={onToggleFavorite}
          size="sm"
        />
      </View>
    </View>
  );
}

export default LectureListCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#eaecf0",
    padding: 18,
    marginBottom: 14,
  },
  cardMain: {
    paddingRight: 4,
  },
  topRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: "#344054",
    marginBottom: 12,
  },
  metaRow: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#475467",
    marginBottom: 4,
  },
  cardUpdatedAt: {
    fontSize: 13,
    color: "#667085",
  },
  cardFavorite: {
    marginTop: 12,
    alignItems: "flex-start",
  },
});