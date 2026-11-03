export interface ApiValidationError {
  field: string;
  message: string;
}

export interface RecordApiErrorResponse {
  message: string;
  errors?: ApiValidationError[];
}
