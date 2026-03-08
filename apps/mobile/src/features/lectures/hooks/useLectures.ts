import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { LectureSummary } from "../types";
import { filterLectures } from "../utils/filterLectures";
import { readLectureCache, writeLectureCache } from "../utils/lectureCache";

type FetchLecturesFn = () => Promise<LectureSummary[]>;

type UseLecturesOptions = {
  fetchLectures: FetchLecturesFn;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Не удалось загрузить лекции.";
}

function sortLectures(lectures: LectureSummary[]): LectureSummary[] {
  return [...lectures].sort((a, b) =>
    a.title.localeCompare(b.title, "ru", { sensitivity: "base" }),
  );
}

export function useLectures({ fetchLectures }: UseLecturesOptions) {
  const isMountedRef = useRef(true);

  const [lectures, setLectures] = useState<LectureSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const safeSetState = useCallback((callback: () => void) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);

  const syncFromNetwork = useCallback(
    async (options?: { asRefresh?: boolean; hasFallbackData?: boolean }) => {
      const asRefresh = options?.asRefresh ?? false;
      const hasFallbackData = options?.hasFallbackData ?? false;

      safeSetState(() => {
        if (asRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);
      });

      try {
        const freshLectures = sortLectures(await fetchLectures());
        const savedAt = await writeLectureCache(freshLectures);

        safeSetState(() => {
          setLectures(freshLectures);
          setLastUpdated(savedAt);
          setIsOffline(false);
          setIsUsingCache(false);
          setError(null);
        });
      } catch (error) {
        safeSetState(() => {
          if (hasFallbackData) {
            setIsOffline(true);
            setIsUsingCache(true);
            setError("Нет сети. Показан последний сохранённый список лекций.");
          } else {
            setError(getErrorMessage(error));
          }
        });
      } finally {
        safeSetState(() => {
          if (asRefresh) {
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        });
      }
    },
    [fetchLectures, safeSetState],
  );

  const loadLectures = useCallback(async () => {
    safeSetState(() => {
      setIsLoading(true);
      setError(null);
    });

    const cached = await readLectureCache();

    if (cached && cached.lectures.length > 0) {
      safeSetState(() => {
        setLectures(sortLectures(cached.lectures));
        setLastUpdated(cached.savedAt);
        setIsUsingCache(true);
        setIsLoading(false);
      });

      void syncFromNetwork({
        asRefresh: true,
        hasFallbackData: true,
      });

      return;
    }

    await syncFromNetwork({
      asRefresh: false,
      hasFallbackData: false,
    });
  }, [safeSetState, syncFromNetwork]);

  const refreshLectures = useCallback(async () => {
    await syncFromNetwork({
      asRefresh: true,
      hasFallbackData: lectures.length > 0,
    });
  }, [lectures.length, syncFromNetwork]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadLectures();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadLectures]);

  const filteredLectures = useMemo(() => {
    return filterLectures(lectures, query);
  }, [lectures, query]);

  return {
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
    loadLectures,
    refreshLectures,
  };
}