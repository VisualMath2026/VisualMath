import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CatalogSyncInfo from "../components/CatalogSyncInfo";
import FilterChip from "../components/FilterChip";
import LectureListCard from "../components/LectureListCard";
import { fetchLectures } from "../features/lectures/api/fetchLectures";
import { useLectures } from "../features/lectures/hooks/useLectures";
import { buildLectureRouteParams } from "../features/lectures/utils/buildLectureRouteParams";
import { useFavorites } from "../hooks/useFavorites";

type LecturesListScreenProps = {
  navigation: {
    navigate: (screenName: string, params?: Record<string, unknown>) => void;
  };
};

function formatLastUpdated(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("ru-RU");
}

function normalizeSubject(subject: string): string {
  return subject.trim();
}

export function LecturesListScreen({ navigation }: LecturesListScreenProps) {
  const {
    lectures,
    filteredLectures,
    query,
    setQuery,
    isLoading,
    isRefreshing,
    isOffline,
    isUsingCache,
    error,
    lastUpdated,
    refreshLectures,
  } = useLectures({
    fetchLectures,
  });

  const { favorites, toggleFavorite } = useFavorites();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const favoriteIds = useMemo(() => new Set(favorites), [favorites]);

  const subjectOptions = useMemo(() => {
    const uniqueSubjects = Array.from(
      new Set(
        lectures
          .map((lecture) => lecture.subject)
          .filter((value): value is string => Boolean(value && value.trim()))
          .map(normalizeSubject),
      ),
    );

    return uniqueSubjects.sort((a, b) =>
      a.localeCompare(b, "ru", { sensitivity: "base" }),
    );
  }, [lectures]);

  const visibleLectures = useMemo(() => {
    let result = filteredLectures;

    if (selectedSubject !== "all") {
      result = result.filter(
        (lecture) => normalizeSubject(lecture.subject ?? "") === selectedSubject,
      );
    }

    if (showOnlyFavorites) {
      result = result.filter((lecture) => favoriteIds.has(lecture.id));
    }

    return result;
  }, [favoriteIds, filteredLectures, selectedSubject, showOnlyFavorites]);

  const lastUpdatedLabel = formatLastUpdated(lastUpdated);

  if (isLoading && visibleLectures.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загружаем лекции...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>VisualMath Mobile</Text>
      <Text style={styles.screenSubtitle}>Список лекций через @vm/vm-api</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Поиск по названию и описанию"
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersContainer}
      >
        <FilterChip
          label="Все"
          isSelected={selectedSubject === "all"}
          onPress={() => setSelectedSubject("all")}
        />

        <FilterChip
          label="Избранное"
          isSelected={showOnlyFavorites}
          onPress={() => setShowOnlyFavorites((current) => !current)}
        />

        {subjectOptions.map((subject) => (
          <FilterChip
            key={subject}
            label={subject}
            isSelected={selectedSubject === subject}
            onPress={() => setSelectedSubject(subject)}
          />
        ))}
      </ScrollView>

      <CatalogSyncInfo
        error={error}
        isOffline={isOffline}
        isUsingCache={isUsingCache}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <FlatList
        data={visibleLectures}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshLectures} />
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          visibleLectures.length === 0 ? styles.emptyContent : styles.listContent
        }
        renderItem={({ item }) => (
          <LectureListCard
            item={item}
            isFavorite={favoriteIds.has(item.id)}
            onPress={() =>
              navigation.navigate("Lecture", buildLectureRouteParams(item))
            }
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Ничего не найдено</Text>
            <Text style={styles.emptyText}>
              Попробуй изменить поиск или фильтры.
            </Text>
          </View>
        }
      />
    </View>
  );
}

export default LecturesListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7fb",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f7f7fb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#344054",
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 16,
    color: "#475467",
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e4e7ec",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  filtersContainer: {
    marginBottom: 8,
    maxHeight: 44,
  },
  filtersRow: {
    paddingRight: 8,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  emptyBox: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#101828",
  },
  emptyText: {
    textAlign: "center",
    color: "#667085",
  },
});