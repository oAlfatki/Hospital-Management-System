export interface ApiValidationError {
  code: string;
  field: string | null;
  message: string;
}