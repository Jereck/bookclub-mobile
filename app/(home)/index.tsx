import { View, Text, ScrollView, Image, Pressable } from "react-native"
import { useAppStore } from "../../store/store"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect } from "expo-router"

export default function HomeTab() {
  const { user, fetchUserProfile } = useAppStore()

  useFocusEffect(() => {
    fetchUserProfile()
  })

  const currentlyReading = user?.currentlyReading

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 mb-6" showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        {/* Header */}
        <View className="px-4 pt-6 pb-4 bg-indigo-50 dark:bg-indigo-950 rounded-b-3xl shadow-md flex-row justify-between items-center">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 items-center justify-center">
              <Feather name="smile" size={20} color="#6366f1" />
            </View>
            <View>
              <Text className="text-xs text-indigo-700 dark:text-indigo-300">Welcome back,</Text>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.username || "Reader"}
              </Text>
            </View>
          </View>

          <Pressable className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 items-center justify-center">
            <Feather name="bell" size={20} color="#6366f1" />
          </Pressable>
        </View>

        {/* Currently Reading */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Currently Reading</Text>
          {currentlyReading ? (
            <View className="flex-row">
              <Image
                source={{ uri: currentlyReading.image }}
                style={{ width: 96, height: 144, borderRadius: 8 }}
                resizeMode="cover"
              />
              <View className="ml-4 flex-1 justify-center">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-1" numberOfLines={2}>
                  {currentlyReading.title}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3" numberOfLines={1}>
                  {currentlyReading.authors?.[0] || "Unknown Author"}
                </Text>
                <Pressable className="mt-3 py-2 px-4 bg-indigo-600 rounded-full self-start">
                  <Text className="text-white font-medium text-sm">Continue Reading</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="items-center py-4">
              <Feather name="book" size={32} color="#9ca3af" />
              <Text className="text-gray-500 dark:text-gray-400 mt-2">You're not reading anything yet</Text>
            </View>
          )}
        </View>

        {/* Placeholder Sections */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Featured Books</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Coming soon...</Text>
        </View>

        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Upcoming Meetings</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">No meetings scheduled yet</Text>
        </View>

        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Recent Discussions</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Discussions will appear here</Text>
        </View>


      </SafeAreaView>
    </ScrollView>
  )
}
