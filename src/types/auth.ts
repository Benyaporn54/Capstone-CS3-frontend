// Matches the response of POST /v1/auth/sync (SCRUM-161)
export type UserRole = "student" | "staff" | "admin";

export type UserProfile = {
  userId: number;
  email: string;
  studentId: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
};
