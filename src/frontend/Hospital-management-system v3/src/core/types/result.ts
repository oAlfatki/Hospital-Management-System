export interface SuccessResult<T> {
  success: true;
  data: T;
}

export interface ErrorResult {
  success: false;
  error: {
    message: string;
    details?: any;
  };
}

export type Result<T> = SuccessResult<T> | ErrorResult;
