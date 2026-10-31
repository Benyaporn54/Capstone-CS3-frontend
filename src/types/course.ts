// Matches the API contract of GET /api/v1/courses (SCRUM-142)

export type CourseCategory = {
  categoryId: number;
  code: string;
  nameTh: string;
  nameEn: string;
};

export type CourseListItem = {
  id: number;
  courseCode: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  isActive: boolean;
  tags: string[];
  categories: CourseCategory[];
};
