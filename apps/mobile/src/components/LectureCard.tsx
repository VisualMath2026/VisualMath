import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { appStyles as styles } from "../styles/appStyles";
import type { Lecture } from "../types/lecture";
import { formatDate, getLecturePreview } from "../utils/lecture";

type LectureCardProps = {
  lecture: Lecture;
  index: number;
  isFavorite: boolean;
  onPress: () => void;
};

export function LectureCard({
  lecture,
  index,
  isFavorite,
  onPress
}: LectureCardProps): React.JSX.Element {
  const title = lecture.title?.trim() || `Лекция ${index + 1}`;
  const subtitle = getLecturePreview(lecture);
  const updatedAt = formatDate(lecture.updatedAt);

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{subtitle}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>
          {updatedAt ? `Обновлено: ${updatedAt}` : ""}
        </Text>
        {isFavorite ? <Text style={styles.favoriteBadge}>★</Text> : null}
      </View>
    </TouchableOpacity>
  );
}