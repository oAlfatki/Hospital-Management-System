export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isBadRequest(): boolean {
    return this.statusCode === 400;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isConflict(): boolean {
    return this.statusCode === 409;
  }

  get isValidationError(): boolean {
    return this.statusCode === 422;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  getFieldError(field: string): string | undefined {
    return this.fieldErrors?.[field]?.[0];
  }
}