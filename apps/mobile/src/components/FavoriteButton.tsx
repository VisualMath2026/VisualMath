import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
  size?: "sm" | "md";
};

export function FavoriteButton({
  isFavorite,
  onPress,
  size = "md",
}: FavoriteButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, size === "sm" ? styles.buttonSm : styles.buttonMd]}
    >
      <Text style={[styles.text, size === "sm" ? styles.textSm : styles.textMd]}>
        {isFavorite ? "★ В избранном" : "☆ В избранное"}
      </Text>
    </Pressable>
  );
}

export default FavoriteButton;

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "#d0d7de",
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSm: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonMd: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    fontWeight: "600",
    color: "#344054",
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
});