// Spring Data style paginated response
export type Page<T> = {
  content: T[];
  /** 0-based */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
