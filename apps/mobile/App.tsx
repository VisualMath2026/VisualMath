import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

const API_BASE_URL = "http://192.168.78.23:3001";

type Lecture = {
  id?: string | number;
  title?: string;
  description?: string;
  summary?: string;
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

export default function App(): React.JSX.Element {
  const [lectures, setLectures] = useState<Lecture[]>([]);
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

  const renderItem = useCallback(
    ({ item, index }: { item: Lecture; index: number }) => {
      const title = item.title?.trim() || `Лекция ${index + 1}`;
      const subtitle =
        item.description?.trim() ||
        item.summary?.trim() ||
        "Описание пока не добавлено";

      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{subtitle}</Text>

          {item.updatedAt ? (
            <Text style={styles.cardMeta}>Обновлено: {item.updatedAt}</Text>
          ) : null}
        </View>
      );
    },
    []
  );

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
            renderItem={renderItem}
            contentContainerStyle={
              lectures.length === 0 ? styles.emptyListContent : styles.listContent
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
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
  }
});