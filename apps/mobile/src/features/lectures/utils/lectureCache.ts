import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LectureSummary } from "../types";

const LECTURES_CACHE_KEY = "vm.mobile.lectures.cache.v1";
const CACHE_VERSION = 1;

type LectureCachePayload = {
  version: number;
  savedAt: string;
  lectures: LectureSummary[];
};

export async function readLectureCache(): Promise<LectureCachePayload | null> {
  try {
    const rawValue = await AsyncStorage.getItem(LECTURES_CACHE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<LectureCachePayload>;

    if (parsed.version !== CACHE_VERSION || !Array.isArray(parsed.lectures)) {
      return null;
    }

    return {
      version: CACHE_VERSION,
      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date(0).toISOString(),
      lectures: parsed.lectures as LectureSummary[],
    };
  } catch {
    return null;
  }
}

export async function writeLectureCache(
  lectures: LectureSummary[],
): Promise<string> {
  const savedAt = new Date().toISOString();

  const payload: LectureCachePayload = {
    version: CACHE_VERSION,
    savedAt,
    lectures,
  };

  await AsyncStorage.setItem(LECTURES_CACHE_KEY, JSON.stringify(payload));

  return savedAt;
}

export async function clearLectureCache(): Promise<void> {
  await AsyncStorage.removeItem(LECTURES_CACHE_KEY);
}