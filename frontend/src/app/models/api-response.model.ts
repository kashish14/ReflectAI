/**
 * Shared API response and error shapes — aligns with backend error contract.
 */
export interface PaginatedResponse<T> {
  data: T[];
  next_cursor?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
