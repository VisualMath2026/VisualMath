import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { appStyles as styles } from "../styles/appStyles";
import type { Lecture } from "../types/lecture";
import { formatDate, getLectureBlocks } from "../utils/lecture";

type LectureDetailsScreenProps = {
  lecture: Lecture | null;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
};

export function LectureDetailsScreen({
  lecture,
  isFavorite,
  onBack,
  onToggleFavorite
}: LectureDetailsScreenProps): React.JSX.Element {
  if (!lecture) {
    return (
      <View style={styles.centerBlock}>
        <Text style={styles.infoText}>Лекция не найдена.</Text>
      </View>
    );
  }

  const title = lecture.title?.trim() || "Лекция";
  const updatedAt = formatDate(lecture.updatedAt);
  const blocks = getLectureBlocks(lecture);

  return (
    <View style={styles.detailsWrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.backButton}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>← Назад к списку</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.detailsScroll}
        contentContainerStyle={styles.detailsScreen}
      >
        <Text style={styles.detailsTitle}>{title}</Text>

        {updatedAt ? (
          <Text style={styles.detailsMeta}>Обновлено: {updatedAt}</Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
        >
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? "★ Убрать из избранного" : "☆ Добавить в избранное"}
          </Text>
        </TouchableOpacity>

        <View style={styles.detailsCard}>
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <Text key={index} style={styles.blockHeading}>
                  {block.text ?? "Подзаголовок"}
                </Text>
              );
            }

            if (block.type === "formula") {
              return (
                <View key={index} style={styles.formulaBlock}>
                  <Text style={styles.formulaLabel}>Формула</Text>
                  <Text style={styles.formulaText}>
                    {block.latex ?? block.text ?? ""}
                  </Text>
                </View>
              );
            }

            if (block.type === "list") {
              return (
                <View key={index} style={styles.listBlock}>
                  {(block.items ?? []).map((item, itemIndex) => (
                    <Text key={itemIndex} style={styles.listItem}>
                      • {item}
                    </Text>
                  ))}
                </View>
              );
            }

            return (
              <Text key={index} style={styles.detailsText}>
                {block.text ?? ""}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}