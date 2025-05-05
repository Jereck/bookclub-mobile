import { Pressable, View, Image, Text } from "react-native";
import { BookClub } from "../lib/api/types";
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient";

export const CurrentBookCard = ({ book, onPress }: { book: BookClub["currentBook"]; onPress?: () => void }) => {
  if (!book) return null

  return (
    <Pressable onPress={onPress} className="mt-6 rounded-xl overflow-hidden shadow-md">
      <LinearGradient
        colors={["rgba(99, 102, 241, 0.8)", "rgba(79, 70, 229, 0.9)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4"
      >
        <View className="flex-row">
          {book.image ? (
            <Image source={{ uri: book.image }} className="w-16 h-24 rounded-md shadow-lg" resizeMode="cover" />
          ) : (
            <View className="w-16 h-24 rounded-md bg-indigo-200 items-center justify-center">
              <Feather name="book" size={24} color="#6366f1" />
            </View>
          )}
          <View className="ml-4 flex-1 justify-center">
            <Text className="text-xs font-medium text-indigo-100 mb-1">CURRENTLY READING</Text>
            <Text className="text-lg font-bold text-white mb-1" numberOfLines={2}>
              {book.title}
            </Text>
            {book.authors && (
              <Text className="text-sm text-indigo-100" numberOfLines={1}>
                {book.authors.join(", ")}
              </Text>
            )}
          </View>
        </View>
        <View className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <View className="h-full bg-white w-1/3 rounded-full" />
        </View>
        <View className="mt-1 flex-row justify-between">
          <Text className="text-xs text-indigo-100">Club Progress</Text>
          <Text className="text-xs font-medium text-white">33%</Text>
        </View>
      </LinearGradient>
    </Pressable>
  )
}