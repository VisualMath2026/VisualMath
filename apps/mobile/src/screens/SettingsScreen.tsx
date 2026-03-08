import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { appStyles as styles } from "../styles/appStyles";

type SettingsScreenProps = {
  apiBaseUrl: string;
  lectureCount: number;
  favoriteCount: number;
  healthLoading: boolean;
  healthText: string;
  settingsReloading: boolean;
  onRefresh: () => void;
};

export function SettingsScreen({
  apiBaseUrl,
  lectureCount,
  favoriteCount,
  healthLoading,
  healthText,
  settingsReloading,
  onRefresh
}: SettingsScreenProps): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.settingsScreen}>
      <Text style={styles.settingsTitle}>Настройки</Text>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>API URL</Text>
        <Text style={styles.settingsValue}>{apiBaseUrl}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Лекций загружено</Text>
        <Text style={styles.settingsValue}>{lectureCount}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Избранных лекций</Text>
        <Text style={styles.settingsValue}>{favoriteCount}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Health-check</Text>
        <Text style={styles.settingsValue}>
          {healthLoading ? "Проверяем..." : healthText}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.reloadButton}
        onPress={onRefresh}
        disabled={settingsReloading}
      >
        <Text style={styles.reloadButtonText}>
          {settingsReloading ? "Обновляем..." : "Обновить данные"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}