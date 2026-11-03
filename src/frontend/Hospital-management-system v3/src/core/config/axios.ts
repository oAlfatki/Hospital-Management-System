import axios, { AxiosError } from "axios";
import { ApiError } from "../Errors/ApiError";
import type { ApiErrorResponse } from "../Errors/ApiErrorResponse";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7286",
  timeout: 1000,
});

axiosInstance.interceptors.response.use(
  // Success
  (response) => {
    // بعض الـ backends ترجع HTTP 200 حتى لو العملية فشلت منطقياً
    if (response.data?.success === false) {
      throw new ApiError(
        response.data.message ?? "فشلت العملية، حاول مرة أخرى",
        response.status,
        response.data.code,
      );
    }
    return response;
  },

  // Error
  (error: AxiosError<ApiErrorResponse>) => {
    // Backend responded (400,401,404,409,500...)

    if (error.response) {
      const { status, data } = error.response;
      console.error("error.response:---------------");
      console.error(error.response);
      console.error("-----------------------------");
      console.error("status:---------------");
      console.error(status);
      console.error("-----------------------------");
      console.error("data:---------------");
      console.error(data);
      console.error("-----------------------------");

      switch (status) {
    case 400:
      throw new ApiError(
        data.message ?? "Unexpected server error.",
        status,
        "BadRequest",
        data.errors
      );

    case 401:
      throw new ApiError(
        data.message ?? "Unexpected server error.",
        status,
        "Unauthorized",
        data.errors
      );

    case 404:
      throw new ApiError(
        data.message ?? "Unexpected server error.",
        status,
        "NotFound",
        data.errors
      );

    case 409:
      throw new ApiError(
        data.message ?? "Unexpected server error."  ,
        status,
        "Conflict",
        data.errors
      );

    case 422:
      throw new ApiError(
        data.message ?? "Unexpected server error."  ,
        status,
        "Validation",
        data.errors
      );

    default:
      throw new ApiError(
        data.message ?? "Unexpected server error",
        status,
        "ServerError",
        data.errors
      );
  }
    }
   

    // Request sent but no response
    if (error.request) {
      throw new ApiError(
        "Unable to connect to the server.",
        0,
        "NETWORK_ERROR",
      );
    }

    // Axios configuration error
    throw new ApiError(error.message, 500, "UNKNOWN_ERROR");
  },
);

// Mock route handler registry stub for backward compatibility
export function registerMockRoute(_method: string, _endpoint: string, _handler: any) {
  // No-op: Mock routes are disabled in production architecture
}

export { axiosInstance as axios };
export default axiosInstance;

