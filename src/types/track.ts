// --- 1. Type สำหรับหน้า Track List (GET /v1/tracks) ---
export type TrackGroup = {
  id: number;
  nameTh: string;
  nameEn: string;
};

export type TrackListItem = {
  id: number;
  nameTh: string;
  nameEn: string;
  description: string;
  group: TrackGroup;
};

// --- 2. Type เพิ่มเติมสำหรับหน้า Track Detail (GET /v1/tracks/{id}) ---
export type TrackCourse = {
  id: number;
  courseCode: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  isRequired: boolean;
  rating?: number | null;
  choiceGroup?: number | null;
};

export type SemesterCourses = {
  year: number;
  semester: number;
  totalCredits: number;
  courses: TrackCourse[];
};

export type CurriculumCategory = {
  key: string;
  label: string;
  credits: number;
};

export type CurriculumSummary = {
  title: string;
  totalCredits: number;
  categories: CurriculumCategory[];
};

export type RelatedTrack = {
  id: number;
  nameTh: string;
  nameEn?: string;
};

// Type รวมสำหรับข้อมูลหน้า Detail
export type TrackDetailData = {
  id: number;
  nameTh: string;
  nameEn: string;
  description: string;
  totalCredits: number;
  group: TrackGroup;
  semesters: SemesterCourses[];
  curriculumSummary: CurriculumSummary;
  relatedTracks: RelatedTrack[];
};
