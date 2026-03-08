import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import FavoriteButton from "../components/FavoriteButton";
import { useFavorites } from "../hooks/useFavorites";

type LectureScreenProps = {
  navigation: {
    goBack: () => void;
  };
  route: {
    params?: {
      lectureId?: string;
      lectureTitle?: string;
      lectureDescription?: string | null;
      lectureAuthor?: string | null;
      lectureSubject?: string | null;
      lectureSemester?: string | null;
      lectureLevel?: string | null;
      lectureTags?: string[];
      lectureUpdatedAt?: string | null;
    };
  };
};

function formatUpdatedAt(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("ru-RU");
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function LectureScreen({ navigation, route }: LectureScreenProps) {
  const { favorites, toggleFavorite } = useFavorites();

  const lectureId = route.params?.lectureId ?? "";
  const lectureTitle = route.params?.lectureTitle ?? "Лекция";
  const lectureDescription =
    route.params?.lectureDescription?.trim() ||
    "Описание лекции пока не добавлено.";
  const lectureAuthor = route.params?.lectureAuthor ?? null;
  const lectureSubject = route.params?.lectureSubject ?? null;
  const lectureSemester = route.params?.lectureSemester ?? null;
  const lectureLevel = route.params?.lectureLevel ?? null;
  const lectureTags = route.params?.lectureTags ?? [];
  const lectureUpdatedAt = formatUpdatedAt(route.params?.lectureUpdatedAt);

  const isFavorite = lectureId.length > 0 && favorites.includes(lectureId);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={navigation.goBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Назад к списку</Text>
      </Pressable>

      <Text style={styles.title}>{lectureTitle}</Text>

      {lectureUpdatedAt ? (
        <Text style={styles.updatedAt}>Обновлено: {lectureUpdatedAt}</Text>
      ) : null}

      <View style={styles.favoriteWrap}>
        <FavoriteButton
          isFavorite={isFavorite}
          onPress={() => {
            if (lectureId) {
              toggleFavorite(lectureId);
            }
          }}
        />
      </View>

      <View style={styles.card}>
        <InfoRow label="Автор" value={lectureAuthor} />
        <InfoRow label="Предмет" value={lectureSubject} />
        <InfoRow label="Семестр" value={lectureSemester} />
        <InfoRow label="Уровень" value={lectureLevel} />

        {lectureTags.length > 0 ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Теги</Text>
            <View style={styles.tagsWrap}>
              {lectureTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.contentTitle}>Описание</Text>
        <Text style={styles.description}>{lectureDescription}</Text>
      </View>
    </ScrollView>
  );
}

export default LectureScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#f7f7fb",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e4e7ec",
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#101828",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    color: "#0f172a",
    marginBottom: 8,
  },
  updatedAt: {
    fontSize: 14,
    color: "#667085",
    marginBottom: 16,
  },
  favoriteWrap: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eaecf0",
    padding: 16,
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eaecf0",
    padding: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#344054",
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#667085",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#101828",
    fontWeight: "500",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: "#344054",
    fontWeight: "500",
  },
});