import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  View
} from "react-native";
import {
  API_BASE_URL,
  ApiError,
  lecturesUrl,
  visualMathApi
} from "./src/api/client";
import { TabBar } from "./src/components/TabBar";
import { LectureDetailsScreen } from "./src/screens/LectureDetailsScreen";
import { LectureListScreen } from "./src/screens/LectureListScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { appStyles as styles } from "./src/styles/appStyles";
import type { Lecture, TabKey } from "./src/types/lecture";
import { getLectureKey } from "./src/utils/lecture";

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

  const loadLectures = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const data = await visualMathApi.getLectures();
      setLectures(data as unknown as Lecture[]);

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
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      setHealthLoading(true);

      const health = await visualMathApi.getHealth();
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
  }, []);

  useEffect(() => {
    void loadLectures();
    void checkHealth();
  }, [checkHealth, loadLectures]);

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
      return (
        <LectureDetailsScreen
          lecture={selectedLecture}
          isFavorite={
            selectedLecture
              ? favoriteIds.includes(getLectureKey(selectedLecture))
              : false
          }
          onBack={closeLecture}
          onToggleFavorite={() => {
            if (selectedLecture) {
              toggleFavorite(selectedLecture);
            }
          }}
        />
      );
    }

    if (activeTab === "favorites") {
      return (
        <LectureListScreen
          data={favoriteLectures}
          emptyText="Избранных лекций пока нет."
          favoriteIds={favoriteIds}
          refreshing={refreshing}
          onRefresh={handlePullToRefresh}
          onOpenLecture={openLecture}
        />
      );
    }

    if (activeTab === "settings") {
      return (
        <SettingsScreen
          apiBaseUrl={API_BASE_URL}
          lectureCount={lectures.length}
          favoriteCount={favoriteLectures.length}
          healthLoading={healthLoading}
          healthText={healthText}
          settingsReloading={settingsReloading}
          onRefresh={handleSettingsRefresh}
        />
      );
    }

    return (
      <LectureListScreen
        data={lectures}
        emptyText="Лекции не найдены."
        favoriteIds={favoriteIds}
        refreshing={refreshing}
        onRefresh={handlePullToRefresh}
        onOpenLecture={openLecture}
      />
    );
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

        <TabBar activeTab={activeTab} onChange={switchTab} />
      </View>
    </SafeAreaView>
  );
}