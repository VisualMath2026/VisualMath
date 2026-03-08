import type { LectureSummary } from "../types";

export type LectureRouteParams = {
  lectureId: string;
  lectureTitle: string;
  lectureDescription: string | null;
  lectureAuthor: string | null;
  lectureSubject: string | null;
  lectureSemester: string | null;
  lectureLevel: string | null;
  lectureTags: string[];
  lectureUpdatedAt: string | null;
};

export function buildLectureRouteParams(
  lecture: LectureSummary,
): LectureRouteParams {
  return {
    lectureId: lecture.id,
    lectureTitle: lecture.title,
    lectureDescription: lecture.description ?? null,
    lectureAuthor: lecture.author ?? null,
    lectureSubject: lecture.subject ?? null,
    lectureSemester: lecture.semester ?? null,
    lectureLevel: lecture.level ?? null,
    lectureTags: lecture.tags ?? [],
    lectureUpdatedAt: lecture.updatedAt ?? null,
  };
}