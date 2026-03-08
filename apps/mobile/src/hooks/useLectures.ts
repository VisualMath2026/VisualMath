import { useCallback, useEffect, useState } from "react";
import { ApiError, visualMathApi } from "../api/client";
import type { Lecture } from "../types/lecture";

export function useLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsReloading, setSettingsReloading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthText, setHealthText] = useState<string>("Не проверялось");
  const [error, setError] = useState<string | null>(null);

  const loadLectures = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const data = await visualMathApi.getLectures();
      setLectures(data as unknown as Lecture[]);

      return true;
    } catch (err) {
      let message = "Не удалось загрузить лекции";

      if (err instanceof ApiError) {
        if (err.status === 408) {
          message = "Таймаут запроса к серверу";
        } else if (err.status === 0) {
          message = "Сетевая ошибка: сервер недоступен";
        } else {
          message = `Ошибка API: ${err.status}`;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setLectures([]);
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSettingsReloading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      setHealthLoading(true);

      const health = await visualMathApi.getHealth();
      setHealthText(`${health.status} • ${health.service} • ${health.time}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setHealthText(`Ошибка health-check: ${err.status}`);
      } else if (err instanceof Error) {
        setHealthText(`Ошибка: ${err.message}`);
      } else {
        setHealthText("Не удалось получить health-check");
      }
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLectures();
    void checkHealth();
  }, [checkHealth, loadLectures]);

  const refreshLectures = useCallback(() => {
    setRefreshing(true);
    void loadLectures();
  }, [loadLectures]);

  const refreshFromSettings = useCallback(async (): Promise<boolean> => {
    setSettingsReloading(true);
    const ok = await loadLectures();
    await checkHealth();
    return ok;
  }, [checkHealth, loadLectures]);

  return {
    lectures,
    loading,
    refreshing,
    settingsReloading,
    healthLoading,
    healthText,
    error,
    refreshLectures,
    refreshFromSettings
  };
}