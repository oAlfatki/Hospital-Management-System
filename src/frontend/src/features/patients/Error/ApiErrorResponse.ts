import type { ApiValidationError } from "./ApiValidationError";

export interface ApiErrorResponse {
  message: string;
  errors: ApiValidationError[];
}