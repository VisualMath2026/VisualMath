import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CatalogSyncInfo from "../components/CatalogSyncInfo";
import LectureListCard from "../components/LectureListCard";
import { fetchLectures } from "../features/lectures/api/fetchLectures";
import { useLectures } from "../features/lectures/hooks/useLectures";
import { buildLectureRouteParams } from "../features/lectures/utils/buildLectureRouteParams";
import { filterLectures } from "../features/lectures/utils/filterLectures";
import { useFavorites } from "../hooks/useFavorites";

type FavoritesScreenProps = {
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

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const {
    lectures,
    isLoading,
    isRefreshing,
    error,
    isOffline,
    isUsingCache,
    lastUpdated,
    refreshLectures,
  } = useLectures({
    fetchLectures,
  });

  const { favorites, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState("");

  const favoriteIds = useMemo(() => new Set(favorites), [favorites]);

  const favoriteLectures = useMemo(() => {
    const onlyFavorites = lectures.filter((lecture) => favoriteIds.has(lecture.id));

    return filterLectures(onlyFavorites, query);
  }, [favoriteIds, lectures, query]);

  const lastUpdatedLabel = formatLastUpdated(lastUpdated);

  if (isLoading && favoriteLectures.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загружаем избранные лекции...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>VisualMath Mobile</Text>
      <Text style={styles.screenSubtitle}>Избранные лекции</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Поиск по названию и описанию"
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <CatalogSyncInfo
        error={error}
        isOffline={isOffline}
        isUsingCache={isUsingCache}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <FlatList
        data={favoriteLectures}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshLectures} />
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          favoriteLectures.length === 0 ? styles.emptyContent : styles.listContent
        }
        renderItem={({ item }) => (
          <LectureListCard
            item={item}
            isFavorite
            onPress={() =>
              navigation.navigate("Lecture", buildLectureRouteParams(item))
            }
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Избранных лекций пока нет</Text>
            <Text style={styles.emptyText}>
              Добавь лекции в избранное на основном экране.
            </Text>
          </View>
        }
      />
    </View>
  );
}

export default FavoritesScreen;

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