export const GRADE_VALUES = [
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D",
  "F",
  "S",
  "U",
] as const;

export type GradeValue = (typeof GRADE_VALUES)[number];

export type GradeEnrollment = {
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  nameTh: string;
  nameEn: string;
  academicYear: number;
  semester: number;
  enrollmentStatus: "registered";
  currentGrade: GradeValue | null;
};

export type SavedGrade = {
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  grade: GradeValue;
  academicYear: number;
  semester: number;
};
