import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../api/client";

export type AuthUser = {
  id: string;
  name: string;
  role: "student" | "teacher";
  group?: string;
};

type LoginPayload = {
  token: string;
  user: AuthUser;
};

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.authToken),
          AsyncStorage.getItem(STORAGE_KEYS.authUser)
        ]);

        if (isCancelled) {
          return;
        }

        setToken(storedToken);

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser) as AuthUser);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setAuthHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = useCallback(async ({ token, user }: LoginPayload) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.authToken, token),
      AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user))
    ]);

    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.authToken),
      AsyncStorage.removeItem(STORAGE_KEYS.authUser)
    ]);

    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => {
    return Boolean(token && user);
  }, [token, user]);

  return {
    token,
    user,
    authHydrated,
    isAuthenticated,
    login,
    logout
  };
}