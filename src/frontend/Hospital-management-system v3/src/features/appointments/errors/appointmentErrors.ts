export interface ApiValidationError {
  field: string;
  message: string;
}

export interface AppointmentApiErrorResponse {
  message: string;
  errors?: ApiValidationError[];
  suggestions?: string[];
}
