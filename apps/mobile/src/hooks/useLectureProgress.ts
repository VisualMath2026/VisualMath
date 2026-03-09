import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LectureProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export type LectureProgressMap = Record<string, LectureProgressStatus>;

const STORAGE_KEY = "vm.mobile.lecture-progress.v1";

export async function readLectureProgressMap(): Promise<LectureProgressMap> {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const result: LectureProgressMap = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (
        value === "not-started" ||
        value === "in-progress" ||
        value === "completed"
      ) {
        result[key] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
}

async function writeLectureProgressMap(
  progressMap: LectureProgressMap,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
}

export function getLectureProgressStatus(
  progressMap: LectureProgressMap,
  lectureId?: string,
): LectureProgressStatus {
  if (!lectureId) {
    return "not-started";
  }

  return progressMap[lectureId] ?? "not-started";
}

export function useLectureProgressMap() {
  const [progressMap, setProgressMap] = useState<LectureProgressMap>({});
  const [isReady, setIsReady] = useState(false);

  const reload = useCallback(async () => {
    const storedMap = await readLectureProgressMap();
    setProgressMap(storedMap);
    setIsReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    isReady,
    progressMap,
    reload,
  };
}

export function useLectureProgress(lectureId?: string) {
  const [progressMap, setProgressMap] = useState<LectureProgressMap>({});
  const [isReady, setIsReady] = useState(false);

  const reload = useCallback(async () => {
    const storedMap = await readLectureProgressMap();
    setProgressMap(storedMap);
    setIsReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const status = useMemo<LectureProgressStatus>(() => {
    return getLectureProgressStatus(progressMap, lectureId);
  }, [lectureId, progressMap]);

  const setLectureStatus = useCallback(
    async (nextStatus: LectureProgressStatus) => {
      if (!lectureId) {
        return;
      }

      const nextMap: LectureProgressMap = {
        ...progressMap,
        [lectureId]: nextStatus,
      };

      setProgressMap(nextMap);
      await writeLectureProgressMap(nextMap);
    },
    [lectureId, progressMap],
  );

  const markInProgress = useCallback(async () => {
    await setLectureStatus("in-progress");
  }, [setLectureStatus]);

  const markCompleted = useCallback(async () => {
    await setLectureStatus("completed");
  }, [setLectureStatus]);

  const resetProgress = useCallback(async () => {
    await setLectureStatus("not-started");
  }, [setLectureStatus]);

  return {
    isReady,
    status,
    reload,
    markInProgress,
    markCompleted,
    resetProgress,
  };
}

export default useLectureProgress;