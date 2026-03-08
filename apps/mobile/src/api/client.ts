import { ApiError, VisualMathApi } from "@vm/vm-api";

export const API_BASE_URL = "http://192.168.78.23:3001";
export const lecturesUrl = `${API_BASE_URL}/lectures`;

export const visualMathApi = new VisualMathApi({
  baseUrl: API_BASE_URL,
  timeoutMs: 10000
});

export { ApiError };