import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  View
} from "react-native";
import { API_BASE_URL, lecturesUrl } from "./src/api/client";
import { TabBar } from "./src/components/TabBar";
import { useFavorites } from "./src/hooks/useFavorites";
import { useLectures } from "./src/hooks/useLectures";
import { LectureDetailsScreen } from "./src/screens/LectureDetailsScreen";
import { LectureListScreen } from "./src/screens/LectureListScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { appStyles as styles } from "./src/styles/appStyles";
import type { Lecture, TabKey } from "./src/types/lecture";
import { getLectureKey } from "./src/utils/lecture";

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("lectures");
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  const {
    lectures,
    loading,
    refreshing,
    settingsReloading,
    healthLoading,
    healthText,
    error,
    refreshLectures,
    refreshFromSettings
  } = useLectures();

  const { favoriteIds, favoriteLectures, isFavorite, toggleFavorite } =
    useFavorites(lectures);

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

  const handleSettingsRefresh = useCallback(async () => {
    const ok = await refreshFromSettings();

    if (ok) {
      Alert.alert("Готово", "Данные обновлены через @vm/vm-api");
    } else {
      Alert.alert("Ошибка", "Не удалось обновить данные");
    }
  }, [refreshFromSettings]);

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
          isFavorite={selectedLecture ? isFavorite(selectedLecture) : false}
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
          onRefresh={refreshLectures}
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
        onRefresh={refreshLectures}
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