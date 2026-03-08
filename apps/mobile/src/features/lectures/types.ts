export type LectureSummary = {
  id: string;
  title: string;
  description?: string | null;
  author?: string | null;
  tags?: string[];
  subject?: string | null;
  semester?: string | null;
  level?: string | null;
  updatedAt?: string | null;
};