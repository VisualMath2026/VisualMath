import type { LectureSummary } from "../types";

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function filterLectures(
  lectures: LectureSummary[],
  query: string,
): LectureSummary[] {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return lectures;
  }

  return lectures.filter((lecture) => {
    const haystack = normalizeSearchValue(
      [
        lecture.title,
        lecture.description,
        lecture.author,
        lecture.subject,
        lecture.semester,
        lecture.level,
        ...(lecture.tags ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    );

    return haystack.includes(normalizedQuery);
  });
}