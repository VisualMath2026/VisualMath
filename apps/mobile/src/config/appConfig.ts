export const APP_CONFIG = {
  apiBaseUrl: "http://192.168.78.23:3001",
  wsUrl: "ws://192.168.78.23:3001/ws",
  storageKeys: {
    favoriteIds: "vm_mobile_favorite_ids",
    authToken: "vm_mobile_auth_token",
    authUser: "vm_mobile_auth_user",
    lecturesCache: "vm_mobile_lectures_cache"
  }
} as const;