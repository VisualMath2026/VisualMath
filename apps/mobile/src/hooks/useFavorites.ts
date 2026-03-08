import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lecture } from "../types/lecture";
import { getLectureKey } from "../utils/lecture";

const FAVORITES_STORAGE_KEY = "vm_mobile_favorite_ids";

export function useFavorites(lectures: Lecture[]) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadFavorites = async () => {
      try {
        const rawValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

        if (isCancelled) {
          return;
        }

        if (!rawValue) {
          setFavoriteIds([]);
          return;
        }

        const parsed = JSON.parse(rawValue) as unknown;

        if (Array.isArray(parsed)) {
          const normalized = parsed.filter(
            (item): item is string => typeof item === "string"
          );

          setFavoriteIds(normalized);
        } else {
          setFavoriteIds([]);
        }
      } catch {
        setFavoriteIds([]);
      } finally {
        if (!isCancelled) {
          setFavoritesHydrated(true);
        }
      }
    };

    void loadFavorites();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!favoritesHydrated) {
      return;
    }

    void AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteIds)
    );
  }, [favoriteIds, favoritesHydrated]);

  const toggleFavorite = useCallback((lecture: Lecture, index = 0) => {
    const key = getLectureKey(lecture, index);

    setFavoriteIds((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  const isFavorite = useCallback(
    (lecture: Lecture, index = 0) => {
      return favoriteIds.includes(getLectureKey(lecture, index));
    },
    [favoriteIds]
  );

  const favoriteLectures = useMemo(() => {
    return lectures.filter((lecture, index) =>
      favoriteIds.includes(getLectureKey(lecture, index))
    );
  }, [favoriteIds, lectures]);

  return {
    favoriteIds,
    favoriteLectures,
    favoritesHydrated,
    isFavorite,
    toggleFavorite
  };
}