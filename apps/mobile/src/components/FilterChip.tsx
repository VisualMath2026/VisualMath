import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type FilterChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export function FilterChip({
  label,
  isSelected,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default FilterChip;

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d0d7de",
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  chipText: {
    fontSize: 14,
    color: "#344054",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
  },
});