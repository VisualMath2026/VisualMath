import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { appStyles as styles } from "../styles/appStyles";
import type { TabKey } from "../types/lecture";

type TabBarProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

export function TabBar({
  activeTab,
  onChange
}: TabBarProps): React.JSX.Element {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tabButton,
          activeTab === "lectures" ? styles.tabButtonActive : null
        ]}
        onPress={() => onChange("lectures")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "lectures" ? styles.tabButtonTextActive : null
          ]}
        >
          Лекции
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tabButton,
          activeTab === "favorites" ? styles.tabButtonActive : null
        ]}
        onPress={() => onChange("favorites")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "favorites" ? styles.tabButtonTextActive : null
          ]}
        >
          Избранное
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tabButton,
          activeTab === "settings" ? styles.tabButtonActive : null
        ]}
        onPress={() => onChange("settings")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "settings" ? styles.tabButtonTextActive : null
          ]}
        >
          Настройки
        </Text>
      </TouchableOpacity>
    </View>
  );
}