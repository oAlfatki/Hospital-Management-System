export interface ApiValidationError {
  field: string;
  message: string;
}

export interface BillingApiErrorResponse {
  message: string;
  errors?: ApiValidationError[];
}
