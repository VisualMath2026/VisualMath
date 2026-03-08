import React from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { LectureCard } from "../components/LectureCard";
import { SearchBar } from "../components/SearchBar";
import { appStyles as styles } from "../styles/appStyles";
import type { Lecture } from "../types/lecture";
import { getLectureKey } from "../utils/lecture";

type LectureListScreenProps = {
  data: Lecture[];
  emptyText: string;
  favoriteIds: string[];
  refreshing: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onRefresh: () => void;
  onOpenLecture: (lecture: Lecture, index: number) => void;
};

export function LectureListScreen({
  data,
  emptyText,
  favoriteIds,
  refreshing,
  searchQuery,
  onSearchQueryChange,
  onRefresh,
  onOpenLecture
}: LectureListScreenProps): React.JSX.Element {
  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => getLectureKey(item, index)}
      contentContainerStyle={
        data.length === 0 ? styles.emptyListContent : styles.listContent
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder="Поиск по названию и описанию"
        />
      }
      renderItem={({ item, index }) => (
        <LectureCard
          lecture={item}
          index={index}
          isFavorite={favoriteIds.includes(getLectureKey(item, index))}
          onPress={() => onOpenLecture(item, index)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.centerBlock}>
          <Text style={styles.infoText}>{emptyText}</Text>
        </View>
      }
    />
  );
}