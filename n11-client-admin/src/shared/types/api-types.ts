export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

export interface BaseResponse<T> {
  result: { resultCode: string; resultText?: string };
  errorMessage?: string | null;
  data: T;
}
