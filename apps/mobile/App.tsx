import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { API_BASE_URL, lecturesUrl } from "./src/api/client";
import { TabBar } from "./src/components/TabBar";
import { useAuth } from "./src/hooks/useAuth";
import { useFavorites } from "./src/hooks/useFavorites";
import { useLectures } from "./src/hooks/useLectures";
import { LectureDetailsScreen } from "./src/screens/LectureDetailsScreen";
import { LectureListScreen } from "./src/screens/LectureListScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { appStyles as styles } from "./src/styles/appStyles";
import type { Lecture, TabKey } from "./src/types/lecture";
import { getLectureKey } from "./src/utils/lecture";

function matchesLectureSearch(lecture: Lecture, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    lecture.title,
    lecture.description,
    lecture.summary,
    lecture.content,
    lecture.text,
    lecture.body
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("lectures");
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [demoName, setDemoName] = useState("");
  const [demoRole, setDemoRole] = useState<"student" | "teacher">("student");
  const [searchQuery, setSearchQuery] = useState("");

  const { token, user, authHydrated, isAuthenticated, login, logout } = useAuth();

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

  const {
    favoriteIds,
    favoriteLectures,
    favoritesHydrated,
    isFavorite,
    toggleFavorite
  } = useFavorites(lectures);

  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => matchesLectureSearch(lecture, searchQuery));
  }, [lectures, searchQuery]);

  const filteredFavoriteLectures = useMemo(() => {
    return favoriteLectures.filter((lecture) =>
      matchesLectureSearch(lecture, searchQuery)
    );
  }, [favoriteLectures, searchQuery]);

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

  const handleDemoLogin = useCallback(async () => {
    const normalizedName = demoName.trim();

    if (!normalizedName) {
      Alert.alert("Ошибка", "Введите имя");
      return;
    }

    await login({
      token: "demo-token",
      user: {
        id: "demo-user",
        name: normalizedName,
        role: demoRole,
        group: demoRole === "student" ? "ИВТ-101" : undefined
      }
    });

    setDemoName("");
  }, [demoName, demoRole, login]);

  const handleLogout = useCallback(async () => {
    await logout();
    setSelectedLectureId(null);
    setActiveTab("lectures");
    setSearchQuery("");
  }, [logout]);

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

  const renderLoginScreen = () => {
    return (
      <View style={styles.centerBlock}>
        <View
          style={{
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb"
          }}
        >
          <Text style={styles.title}>Вход</Text>
          <Text style={styles.subtitle}>Демо-авторизация для mobile</Text>

          <TextInput
            value={demoName}
            onChangeText={setDemoName}
            placeholder="Введите имя"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              marginTop: 12,
              marginBottom: 12,
              fontSize: 16
            }}
          />

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDemoRole("student")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor:
                  demoRole === "student" ? "#111827" : "#ffffff",
                borderWidth: 1,
                borderColor: "#e5e7eb"
              }}
            >
              <Text
                style={{
                  color: demoRole === "student" ? "#ffffff" : "#111827",
                  fontWeight: "600"
                }}
              >
                Студент
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDemoRole("teacher")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor:
                  demoRole === "teacher" ? "#111827" : "#ffffff",
                borderWidth: 1,
                borderColor: "#e5e7eb"
              }}
            >
              <Text
                style={{
                  color: demoRole === "teacher" ? "#ffffff" : "#111827",
                  fontWeight: "600"
                }}
              >
                Преподаватель
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.reloadButton}
            onPress={handleDemoLogin}
          >
            <Text style={styles.reloadButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading || !favoritesHydrated || !authHydrated) {
      return (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" />
          <Text style={styles.infoText}>Загружаем данные...</Text>
        </View>
      );
    }

    if (!isAuthenticated) {
      return renderLoginScreen();
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
          data={filteredFavoriteLectures}
          emptyText="Избранных лекций пока нет."
          favoriteIds={favoriteIds}
          refreshing={refreshing}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onRefresh={refreshLectures}
          onOpenLecture={openLecture}
        />
      );
    }

    if (activeTab === "settings") {
      return (
        <View style={{ flex: 1 }}>
          <SettingsScreen
            apiBaseUrl={API_BASE_URL}
            lectureCount={lectures.length}
            favoriteCount={favoriteLectures.length}
            healthLoading={healthLoading}
            healthText={healthText}
            settingsReloading={settingsReloading}
            onRefresh={handleSettingsRefresh}
          />

          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                gap: 8
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
                Пользователь
              </Text>
              <Text style={{ color: "#374151" }}>Имя: {user?.name ?? "-"}</Text>
              <Text style={{ color: "#374151" }}>Роль: {user?.role ?? "-"}</Text>
              <Text style={{ color: "#374151" }}>Токен: {token ?? "-"}</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.reloadButton}
                onPress={handleLogout}
              >
                <Text style={styles.reloadButtonText}>Выйти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <LectureListScreen
        data={filteredLectures}
        emptyText="Лекции не найдены."
        favoriteIds={favoriteIds}
        refreshing={refreshing}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onRefresh={refreshLectures}
        onOpenLecture={openLecture}
      />
    );
  };

  const headerSubtitle =
    !isAuthenticated
      ? "Демо-авторизация"
      : activeTab === "lectures"
        ? "Список лекций через @vm/vm-api"
        : activeTab === "favorites"
          ? "Избранные лекции"
          : "Параметры приложения";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {!(activeTab === "lectures" && selectedLectureId && isAuthenticated) ? (
          <View style={styles.header}>
            <Text style={styles.title}>VisualMath Mobile</Text>
            <Text style={styles.subtitle}>{headerSubtitle}</Text>
            <Text style={styles.endpoint}>{lecturesUrl}</Text>
          </View>
        ) : null}

        <View style={styles.content}>{renderContent()}</View>

        {isAuthenticated ? <TabBar activeTab={activeTab} onChange={switchTab} /> : null}
      </View>
    </SafeAreaView>
  );
}