import type { Lecture, LectureBlock } from "../types/lecture";

export function getLectureKey(lecture: Lecture, index = 0): string {
  return String(lecture.id ?? `lecture-${index}`);
}

export function formatDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ru-RU");
}

export function getLecturePreview(lecture: Lecture): string {
  return (
    lecture.description?.trim() ||
    lecture.summary?.trim() ||
    "Описание пока не добавлено"
  );
}

export function getLectureBlocks(lecture: Lecture): LectureBlock[] {
  if (Array.isArray(lecture.blocks) && lecture.blocks.length > 0) {
    return lecture.blocks;
  }

  const raw =
    lecture.content?.trim() ||
    lecture.text?.trim() ||
    lecture.body?.trim() ||
    lecture.summary?.trim() ||
    lecture.description?.trim() ||
    "";

  if (!raw) {
    return [
      {
        type: "paragraph",
        text: "Полное содержание лекции пока не добавлено."
      }
    ];
  }

  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [{ type: "paragraph", text: raw }];
  }

  return paragraphs.map((text) => ({
    type: "paragraph",
    text
  }));
}