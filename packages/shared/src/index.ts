export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  id: string;
  login: string;
  fullName: string;
  role: UserRole;
  groupNumber?: string;
}

export interface LectureSummary {
  id: string;
  title: string;
  subject: string;
  author: string;
  tags: string[];
  updatedAt: string; // ISO 8601
}

export interface SessionSummary {
  id: string;
  lectureId: string;
  status: "active" | "stopped";
  createdAt: string; // ISO 8601
}