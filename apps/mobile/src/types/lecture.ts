export type LectureBlock = {
  type?: "heading" | "paragraph" | "formula" | "list";
  text?: string;
  latex?: string;
  items?: string[];
};

export type Lecture = {
  id?: string | number;
  title?: string;
  description?: string;
  summary?: string;
  content?: string;
  text?: string;
  body?: string;
  updatedAt?: string;
  blocks?: LectureBlock[];
};

export type TabKey = "lectures" | "favorites" | "settings";