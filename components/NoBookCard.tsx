import { Pressable, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons"

export const NoBookCard = ({ onPress, isOwner }: { onPress?: () => void; isOwner: boolean }) => (
  <Pressable
    onPress={onPress}
    disabled={!isOwner}
    className="mt-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 items-center justify-center"
  >
    <Feather name="book" size={32} color="#9ca3af" />
    <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mt-2 text-center">
      No book set for this club yet
    </Text>
    {isOwner && (
      <View className="mt-3 px-4 py-2 bg-indigo-600 rounded-lg">
        <Text className="text-white font-medium">Set a Book</Text>
      </View>
    )}
  </Pressable>
)