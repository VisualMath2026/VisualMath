import React from "react";
import { StyleSheet, Text, View } from "react-native";

type CatalogSyncInfoProps = {
  error: string | null;
  isOffline: boolean;
  isUsingCache: boolean;
  lastUpdatedLabel: string | null;
};

export function CatalogSyncInfo({
  error,
  isOffline,
  isUsingCache,
  lastUpdatedLabel,
}: CatalogSyncInfoProps) {
  const hasContent =
    Boolean(error) ||
    (isOffline && isUsingCache) ||
    (!isOffline && isUsingCache) ||
    Boolean(lastUpdatedLabel);

  if (!hasContent) {
    return null;
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isOffline && isUsingCache ? (
        <Text style={styles.warningText}>Оффлайн-режим: показан кэш.</Text>
      ) : null}

      {!isOffline && isUsingCache ? (
        <Text style={styles.neutralText}>
          Сначала загружен локальный кэш, затем идёт обновление.
        </Text>
      ) : null}

      {lastUpdatedLabel ? (
        <Text style={styles.neutralText}>
          Последнее обновление каталога: {lastUpdatedLabel}
        </Text>
      ) : null}
    </View>
  );
}

export default CatalogSyncInfo;

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  errorText: {
    color: "#b42318",
    marginBottom: 8,
  },
  warningText: {
    color: "#b54708",
    marginBottom: 8,
  },
  neutralText: {
    color: "#667085",
    marginBottom: 8,
    fontSize: 13,
  },
});