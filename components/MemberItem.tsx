import { Animated, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons"
import { User } from "../lib/api/types";

export const MemberItem = ({ member, isOwner }: { member: User; isOwner: boolean }) => {
  const initials = member.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <Animated.View
      className="mb-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
      // entering={Animated.FadeInUp.delay(200).duration(400)}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
          <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{initials}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-medium text-gray-900 dark:text-white">{member.username}</Text>
            {isOwner && (
              <View className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Text className="text-xs font-medium text-amber-600 dark:text-amber-400">Owner</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{member.email}</Text>
        </View>
        <Feather name="more-vertical" size={20} color="#9ca3af" />
      </View>
    </Animated.View>
  )
}