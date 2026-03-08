import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const API_BASE_URL = "http://192.168.78.23:3001";

type Lecture = {
  id?: string | number;
  title?: string;
  description?: string;
  summary?: string;
  content?: string;
  text?: string;
  body?: string;
  updatedAt?: string;
};

function normalizeLectures(payload: unknown): Lecture[] {
  if (Array.isArray(payload)) {
    return payload as Lecture[];
  }

  if (payload && typeof payload === "object") {
    const maybeObject = payload as {
      data?: unknown;
      items?: unknown;
      lectures?: unknown;
    };

    if (Array.isArray(maybeObject.data)) {
      return maybeObject.data as Lecture[];
    }

    if (Array.isArray(maybeObject.items)) {
      return maybeObject.items as Lecture[];
    }

    if (Array.isArray(maybeObject.lectures)) {
      return maybeObject.lectures as Lecture[];
    }
  }

  return [];
}

function formatDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ru-RU");
}

function getLecturePreview(lecture: Lecture): string {
  return (
    lecture.description?.trim() ||
    lecture.summary?.trim() ||
    "Описание пока не добавлено"
  );
}

function getLectureContent(lecture: Lecture): string {
  return (
    lecture.content?.trim() ||
    lecture.text?.trim() ||
    lecture.body?.trim() ||
    lecture.description?.trim() ||
    lecture.summary?.trim() ||
    "Полное содержание лекции пока не добавлено."
  );
}

export default function App(): React.JSX.Element {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lecturesUrl = useMemo(() => `${API_BASE_URL}/lectures`, []);

  const loadLectures = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(lecturesUrl, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = (await response.json()) as unknown;
      const normalized = normalizeLectures(json);

      setLectures(normalized);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить лекции";
      setError(message);
      setLectures([]);
      setSelectedLecture(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lecturesUrl]);

  useEffect(() => {
    void loadLectures();
  }, [loadLectures]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadLectures();
  }, [loadLectures]);

  if (selectedLecture) {
    const title = selectedLecture.title?.trim() || "Лекция";
    const content = getLectureContent(selectedLecture);
    const updatedAt = formatDate(selectedLecture.updatedAt);

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.detailsScreen}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => setSelectedLecture(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backButtonText}>← Назад к списку</Text>
          </TouchableOpacity>

          <Text style={styles.detailsTitle}>{title}</Text>

          {updatedAt ? (
            <Text style={styles.detailsMeta}>Обновлено: {updatedAt}</Text>
          ) : null}

          <View style={styles.detailsCard}>
            <Text style={styles.detailsText}>{content}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>VisualMath Mobile</Text>
        <Text style={styles.subtitle}>Список лекций с сервера</Text>
        <Text style={styles.endpoint}>{lecturesUrl}</Text>

        {loading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" />
            <Text style={styles.infoText}>Загружаем лекции...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerBlock}>
            <Text style={styles.errorTitle}>Ошибка загрузки</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.infoText}>
              Проверь, что server-mock запущен и iPhone находится в той же сети
              Wi-Fi, что и компьютер.
            </Text>
          </View>
        ) : (
          <FlatList
            data={lectures}
            keyExtractor={(item, index) =>
              String(item.id ?? `lecture-${index}`)
            }
            contentContainerStyle={
              lectures.length === 0 ? styles.emptyListContent : styles.listContent
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item, index }) => {
              const title = item.title?.trim() || `Лекция ${index + 1}`;
              const subtitle = getLecturePreview(item);
              const updatedAt = formatDate(item.updatedAt);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.card}
                  onPress={() => setSelectedLecture(item)}
                >
                  <Text style={styles.cardTitle}>{title}</Text>
                  <Text style={styles.cardDescription}>{subtitle}</Text>

                  {updatedAt ? (
                    <Text style={styles.cardMeta}>Обновлено: {updatedAt}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerBlock}>
                <Text style={styles.infoText}>Лекции не найдены.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fb"
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827"
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 8
  },
  endpoint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16
  },
  listContent: {
    paddingBottom: 24
  },
  emptyListContent: {
    flexGrow: 1
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  infoText: {
    marginTop: 12,
    textAlign: "center",
    color: "#4b5563",
    fontSize: 15
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 8
  },
  errorText: {
    textAlign: "center",
    color: "#7f1d1d",
    fontSize: 15
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151"
  },
  cardMeta: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280"
  },
  detailsScreen: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },
  detailsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  detailsMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151"
  }
});