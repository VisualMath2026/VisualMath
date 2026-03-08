import { useCallback, useMemo, useState } from "react";
import type { Lecture } from "../types/lecture";
import { getLectureKey } from "../utils/lecture";

export function useFavorites(lectures: Lecture[]) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

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
    isFavorite,
    toggleFavorite
  };
}