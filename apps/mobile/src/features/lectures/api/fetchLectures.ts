import type { LectureSummary } from "../types";


import { lecturesApi } from "@vm/vm-api";

type RawLecture = Record<string, unknown>;

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeLecture(raw: RawLecture): LectureSummary {
  return {
    id:
      readString(raw.id) ??
      readString(raw.lectureId) ??
      String(Date.now() + Math.random()),
    title:
      readString(raw.title) ??
      readString(raw.name) ??
      "Лекция без названия",
    description: readString(raw.description),
    author: readString(raw.author) ?? readString(raw.authorName),
    tags: readStringArray(raw.tags),
    subject: readString(raw.subject),
    semester: readString(raw.semester),
    level: readString(raw.level),
    updatedAt: readString(raw.updatedAt),
  };
}

function extractItems(response: unknown): RawLecture[] {
  if (Array.isArray(response)) {
    return response as RawLecture[];
  }

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as { items?: unknown }).items)
  ) {
    return (response as { items: RawLecture[] }).items;
  }

  return [];
}

export async function fetchLectures(): Promise<LectureSummary[]> {
  const response = await lecturesApi.listLectures();
  const items = extractItems(response);

  return items.map(normalizeLecture);
}