import { ApiError, VisualMathApi } from "@vm/vm-api";
import { APP_CONFIG } from "../config/appConfig";

export const API_BASE_URL = APP_CONFIG.apiBaseUrl;
export const WS_URL = APP_CONFIG.wsUrl;
export const STORAGE_KEYS = APP_CONFIG.storageKeys;

export const lecturesUrl = `${API_BASE_URL}/lectures`;

export const visualMathApi = new VisualMathApi({
  baseUrl: API_BASE_URL,
  timeoutMs: 10000
});

export { ApiError };