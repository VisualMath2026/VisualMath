import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import FavoriteButton from "./FavoriteButton";
import type { LectureSummary } from "../features/lectures/types";

type LectureListCardProps = {
  item: LectureSummary;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

function formatLastUpdated(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("ru-RU");
}

export function LectureListCard({
  item,
  isFavorite,
  onPress,
  onToggleFavorite,
}: LectureListCardProps) {
  const updatedAtLabel = formatLastUpdated(item.updatedAt);

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.cardMain}>
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