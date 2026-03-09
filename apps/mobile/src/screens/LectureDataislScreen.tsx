import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import FavoriteButton from "../components/FavoriteButton";
import LectureProgressBadge from "../components/LectureProgressBadge";
import SelfCheckBlock from "../components/SelfCheckBlock";
import {
  getLectureContentByTitle,
  type LectureContentBlock,
} from "../features/lectures/content/lectureContent";
import { useLectureProgress } from "../hooks/useLectureProgress";
import type { Lecture } from "../types/lecture";
import { formatDateTime } from "../utils/formatDateTime";

type LectureDetailsScreenProps = {
  lecture: Lecture | null;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getLectureRecord(lecture: Lecture | null): Record<string, unknown> {
  return lecture ? (lecture as unknown as Record<string, unknown>) : {};
}

function getLectureTitle(lecture: Lecture | null): string {
  const record = getLectureRecord(lecture);

  return (
    readString(record.title) ??
    readString(record.name) ??
    "Лекция"
  );
}

function getLectureDescription(lecture: Lecture | null): string {
  const record = getLectureRecord(lecture);

  return (
    readString(record.description) ??
    readString(record.summary) ??
    "Описание лекции пока не добавлено."
  );
}

function getLectureBody(lecture: Lecture | null): string {
  const record = getLectureRecord(lecture);

  return (
    readString(record.content) ??
    readString(record.text) ??
    readString(record.body) ??
    readString(record.summary) ??
    readString(record.description) ??
    "Полное содержание лекции пока не добавлено."
  );
}

function getLectureAuthor(lecture: Lecture | null): string | null {
  const record = getLectureRecord(lecture);

  return readString(record.author) ?? readString(record.authorName);
}

function getLectureSubject(lecture: Lecture | null): string | null {
  const record = getLectureRecord(lecture);

  return readString(record.subject) ?? readString(record.category);
}

function getLectureUpdatedAt(lecture: Lecture | null): string | null {
  const record = getLectureRecord(lecture);

  return (
    readString(record.updatedAt) ??
    readString(record.updated_at) ??
    readString(record.lastUpdatedAt)
  );
}

function getLectureTags(lecture: Lecture | null): string[] {
  const record = getLectureRecord(lecture);

  return readStringArray(record.tags);
}

function getLectureProgressKey(lecture: Lecture | null): string {
  const record = getLectureRecord(lecture);

  return (
    readString(record.id) ??
    readString(record.slug) ??
    getLectureTitle(lecture)
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
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

function LectureContentBlockView({
  block,
}: {
  block: LectureContentBlock;
}) {
  if (block.type === "paragraph") {
    return (
      <View style={styles.contentBlock}>
        <Text style={styles.paragraphText}>{block.text}</Text>
      </View>
    );
  }

  if (block.type === "formula") {
    return (
      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Формула</Text>
        <Text style={styles.formulaText}>{block.latex}</Text>
        {block.description ? (
          <Text style={styles.formulaDescription}>{block.description}</Text>
        ) : null}
      </View>
    );
  }

  if (block.type === "note") {
    return (
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>{block.title}</Text>
        <Text style={styles.noteText}>{block.text}</Text>
      </View>
    );
  }

  if (block.type === "checklist") {
    return (
      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>{block.title}</Text>

        {block.items.map((item) => (
          <View key={item} style={styles.checklistRow}>
            <Text style={styles.checklistBullet}>•</Text>
            <Text style={styles.checklistText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <SelfCheckBlock
      title={block.title}
      question={block.question}
      options={block.options}
      correctOptionId={block.correctOptionId}
      explanation={block.explanation}
    />
  );
}

export function LectureDetailsScreen({
  lecture,
  isFavorite,
  onBack,
  onToggleFavorite,
}: LectureDetailsScreenProps) {
  if (!lecture) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>Лекция не найдена</Text>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад к списку</Text>
        </Pressable>
      </View>
    );
  }

  const lectureTitle = getLectureTitle(lecture);
  const lectureDescription = getLectureDescription(lecture);
  const lectureBody = getLectureBody(lecture);
  const lectureAuthor = getLectureAuthor(lecture);
  const lectureSubject = getLectureSubject(lecture);
  const lectureUpdatedAt = formatDateTime(getLectureUpdatedAt(lecture));
  const lectureTags = getLectureTags(lecture);
  const lectureProgressKey = getLectureProgressKey(lecture);
  const contentBlocks = getLectureContentByTitle(lectureTitle);

  const { isReady, status, markInProgress, markCompleted, resetProgress } =
    useLectureProgress(lectureProgressKey);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (status === "not-started") {
      void markInProgress();
    }
  }, [isReady, markInProgress, status]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Назад к списку</Text>
      </Pressable>

      <Text style={styles.title}>{lectureTitle}</Text>

      {lectureUpdatedAt ? (
        <Text style={styles.updatedAt}>Обновлено: {lectureUpdatedAt}</Text>
      ) : null}

      <View style={styles.topRow}>
        <LectureProgressBadge status={status} />
      </View>

      <View style={styles.favoriteWrap}>
        <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Прогресс по лекции</Text>
        <Text style={styles.sectionText}>
          Статус хранится локально на устройстве.
        </Text>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => {
              void markInProgress();
            }}
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>В процессе</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void markCompleted();
            }}
            style={[styles.actionButton, styles.primaryButton]}
          >
            <Text style={styles.primaryButtonText}>Завершить</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void resetProgress();
            }}
            style={[styles.actionButton, styles.ghostButton]}
          >
            <Text style={styles.ghostButtonText}>Сбросить</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <InfoRow label="Автор" value={lectureAuthor} />
        <InfoRow label="Предмет" value={lectureSubject} />

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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.description}>{lectureDescription}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Основной текст</Text>
        <Text style={styles.description}>{lectureBody}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Материалы лекции</Text>

        {contentBlocks.map((block) => (
          <LectureContentBlockView key={block.id} block={block} />
        ))}
      </View>
    </ScrollView>
  );
}

export default LectureDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#f3f4f8",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  updatedAt: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  favoriteWrap: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
    marginBottom: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  secondaryButton: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  ghostButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: "700",
  },
  ghostButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  contentBlock: {
    marginBottom: 14,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
  formulaCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f8fafc",
    padding: 14,
    marginBottom: 14,
  },
  formulaLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 8,
  },
  formulaDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
  },
  noteCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
    padding: 14,
    marginBottom: 14,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#78350f",
  },
  checklistCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 14,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  checklistBullet: {
    fontSize: 16,
    color: "#374151",
    marginRight: 8,
    lineHeight: 22,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },
});