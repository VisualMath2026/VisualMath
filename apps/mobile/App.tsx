import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { ApiError, VisualMathApi } from "@vm/vm-api";

const API_BASE_URL = "http://192.168.78.23:3001";

type LectureBlock = {
  type?: "heading" | "paragraph" | "formula" | "list";
  text?: string;
  latex?: string;
  items?: string[];
};

type Lecture = {
  id?: string | number;
  title?: string;
  description?: string;
  summary?: string;
  content?: string;
  text?: string;
  body?: string;
  updatedAt?: string;
  blocks?: LectureBlock[];
};

type TabKey = "lectures" | "favorites" | "settings";

function getLectureKey(lecture: Lecture, index = 0): string {
  return String(lecture.id ?? `lecture-${index}`);
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

function getLectureBlocks(lecture: Lecture): LectureBlock[] {
  if (Array.isArray(lecture.blocks) && lecture.blocks.length > 0) {
    return lecture.blocks;
  }

  const raw =
    lecture.content?.trim() ||
    lecture.text?.trim() ||
    lecture.body?.trim() ||
    lecture.summary?.trim() ||
    lecture.description?.trim() ||
    "";

  if (!raw) {
    return [
      {
        type: "paragraph",
        text: "Полное содержание лекции пока не добавлено."
      }
    ];
  }

  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [{ type: "paragraph", text: raw }];
  }

  return paragraphs.map((text) => ({
    type: "paragraph",
    text
  }));
}

export default function App(): React.JSX.Element {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("lectures");
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsReloading, setSettingsReloading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthText, setHealthText] = useState<string>("Не проверялось");
  const [error, setError] = useState<string | null>(null);

  const lecturesUrl = useMemo(() => `${API_BASE_URL}/lectures`, []);
  const api = useMemo(() => {
    return new VisualMathApi({
      baseUrl: API_BASE_URL,
      timeoutMs: 10000
    });
  }, []);

  const loadLectures = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const data = await api.getLectures();
      setLectures(data as Lecture[]);

      return true;
    } catch (err) {
      let message = "Не удалось загрузить лекции";

      if (err instanceof ApiError) {
        if (err.status === 408) {
          message = "Таймаут запроса к серверу";
        } else if (err.status === 0) {
          message = "Сетевая ошибка: сервер недоступен";
        } else {
          message = `Ошибка API: ${err.status}`;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setLectures([]);
      setSelectedLectureId(null);
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSettingsReloading(false);
    }
  }, [api]);

  const checkHealth = useCallback(async () => {
    try {
      setHealthLoading(true);

      const health = await api.getHealth();
      setHealthText(`${health.status} • ${health.service} • ${health.time}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setHealthText(`Ошибка health-check: ${err.status}`);
      } else if (err instanceof Error) {
        setHealthText(`Ошибка: ${err.message}`);
      } else {
        setHealthText("Не удалось получить health-check");
      }
    } finally {
      setHealthLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadLectures();
    void checkHealth();
  }, [loadLectures, checkHealth]);

  const selectedLecture = useMemo(() => {
    if (!selectedLectureId) {
      return null;
    }

    return (
      lectures.find(
        (lecture, index) => getLectureKey(lecture, index) === selectedLectureId
      ) ?? null
    );
  }, [lectures, selectedLectureId]);

  const favoriteLectures = useMemo(() => {
    return lectures.filter((lecture, index) =>
      favoriteIds.includes(getLectureKey(lecture, index))
    );
  }, [favoriteIds, lectures]);

  const handlePullToRefresh = useCallback(() => {
    setRefreshing(true);
    void loadLectures();
  }, [loadLectures]);

  const handleSettingsRefresh = useCallback(async () => {
    setSettingsReloading(true);
    const ok = await loadLectures();
    await checkHealth();

    if (ok) {
      Alert.alert("Готово", "Данные обновлены через @vm/vm-api");
    } else {
      Alert.alert("Ошибка", "Не удалось обновить данные");
    }
  }, [checkHealth, loadLectures]);

  const switchTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setSelectedLectureId(null);
  }, []);

  const openLecture = useCallback((lecture: Lecture, index: number) => {
    setActiveTab("lectures");
    setSelectedLectureId(getLectureKey(lecture, index));
  }, []);

  const closeLecture = useCallback(() => {
    setSelectedLectureId(null);
  }, []);

  const toggleFavorite = useCallback((lecture: Lecture, index = 0) => {
    const key = getLectureKey(lecture, index);

    setFavoriteIds((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  const renderLectureCard = ({
    item,
    index
  }: {
    item: Lecture;
    index: number;
  }) => {
    const title = item.title?.trim() || `Лекция ${index + 1}`;
    const subtitle = getLecturePreview(item);
    const updatedAt = formatDate(item.updatedAt);
    const isFavorite = favoriteIds.includes(getLectureKey(item, index));

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => openLecture(item, index)}
      >
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
  };

  const renderLectureList = (data: Lecture[], emptyText: string) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item, index) => getLectureKey(item, index)}
        renderItem={renderLectureCard}
        contentContainerStyle={
          data.length === 0 ? styles.emptyListContent : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullToRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerBlock}>
            <Text style={styles.infoText}>{emptyText}</Text>
          </View>
        }
      />
    );
  };

  const renderLectureDetails = () => {
    if (!selectedLecture) {
      return (
        <View style={styles.centerBlock}>
          <Text style={styles.infoText}>Лекция не найдена.</Text>
        </View>
      );
    }

    const title = selectedLecture.title?.trim() || "Лекция";
    const updatedAt = formatDate(selectedLecture.updatedAt);
    const blocks = getLectureBlocks(selectedLecture);
    const isFavorite = favoriteIds.includes(getLectureKey(selectedLecture));

    return (
      <View style={styles.detailsWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={closeLecture}
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
            onPress={() => toggleFavorite(selectedLecture)}
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
  };

  const renderSettings = () => {
    return (
      <ScrollView contentContainerStyle={styles.settingsScreen}>
        <Text style={styles.settingsTitle}>Настройки</Text>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>API URL</Text>
          <Text style={styles.settingsValue}>{API_BASE_URL}</Text>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Лекций загружено</Text>
          <Text style={styles.settingsValue}>{lectures.length}</Text>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Избранных лекций</Text>
          <Text style={styles.settingsValue}>{favoriteLectures.length}</Text>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Health-check</Text>
          <Text style={styles.settingsValue}>
            {healthLoading ? "Проверяем..." : healthText}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.reloadButton}
          onPress={handleSettingsRefresh}
          disabled={settingsReloading}
        >
          <Text style={styles.reloadButtonText}>
            {settingsReloading ? "Обновляем..." : "Обновить данные"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" />
          <Text style={styles.infoText}>Загружаем лекции...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerBlock}>
          <Text style={styles.errorTitle}>Ошибка загрузки</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (activeTab === "lectures" && selectedLectureId) {
      return renderLectureDetails();
    }

    if (activeTab === "favorites") {
      return renderLectureList(favoriteLectures, "Избранных лекций пока нет.");
    }

    if (activeTab === "settings") {
      return renderSettings();
    }

    return renderLectureList(lectures, "Лекции не найдены.");
  };

  const headerSubtitle =
    activeTab === "lectures"
      ? "Список лекций через @vm/vm-api"
      : activeTab === "favorites"
        ? "Избранные лекции"
        : "Параметры приложения";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {!(activeTab === "lectures" && selectedLectureId) ? (
          <View style={styles.header}>
            <Text style={styles.title}>VisualMath Mobile</Text>
            <Text style={styles.subtitle}>{headerSubtitle}</Text>
            <Text style={styles.endpoint}>{lecturesUrl}</Text>
          </View>
        ) : null}

        <View style={styles.content}>{renderContent()}</View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "lectures" ? styles.tabButtonActive : null
            ]}
            onPress={() => switchTab("lectures")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "lectures" ? styles.tabButtonTextActive : null
              ]}
            >
              Лекции
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "favorites" ? styles.tabButtonActive : null
            ]}
            onPress={() => switchTab("favorites")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "favorites" ? styles.tabButtonTextActive : null
              ]}
            >
              Избранное
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "settings" ? styles.tabButtonActive : null
            ]}
            onPress={() => switchTab("settings")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "settings" ? styles.tabButtonTextActive : null
              ]}
            >
              Настройки
            </Text>
          </TouchableOpacity>
        </View>
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
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
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
    marginBottom: 12
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
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardMeta: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    marginRight: 10
  },
  favoriteBadge: {
    fontSize: 18,
    color: "#9a3412",
    fontWeight: "700"
  },
  detailsWrapper: {
    flex: 1,
    paddingTop: 16
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },
  detailsScroll: {
    flex: 1
  },
  detailsScreen: {
    paddingBottom: 24
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
  favoriteButton: {
    alignSelf: "flex-start",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
    marginBottom: 16
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9a3412"
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
    color: "#374151",
    marginBottom: 12
  },
  blockHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12
  },
  formulaBlock: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  formulaLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6
  },
  formulaText: {
    fontSize: 16,
    color: "#111827"
  },
  listBlock: {
    marginBottom: 12
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 6
  },
  settingsScreen: {
    paddingTop: 16,
    paddingBottom: 24
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16
  },
  settingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12
  },
  settingsLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6
  },
  settingsValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600"
  },
  reloadButton: {
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center"
  },
  reloadButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700"
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    gap: 8
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center"
  },
  tabButtonActive: {
    backgroundColor: "#111827"
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563"
  },
  tabButtonTextActive: {
    color: "#ffffff"
  }
});