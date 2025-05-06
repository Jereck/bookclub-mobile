"use client"

import { View, Text, ScrollView, Image, Pressable, Alert, Dimensions } from "react-native"
import { useAppStore } from "@/store/store"
import { Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { getBookRecommendations, getCurrentlyReadingBooks } from "@/lib/api"
import type { BookshelfEntry } from "@/lib/api/types"
import { LinearGradient } from "expo-linear-gradient"

const today = new Date();
const currentDay = today.getDate();
const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

const { width } = Dimensions.get("window")

export default function HomeTab() {
  const router = useRouter()
  const { token, user, fetchUserProfile } = useAppStore()
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState<BookshelfEntry[]>([])
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true)


  useFocusEffect(
    useCallback(() => {
      setIsLoading(true)
      fetchUserProfile()
      if (token) {
        getCurrentlyReadingBooks(token)
          .then((books) => {
            setCurrentlyReadingBooks(books)
            setIsLoading(false)
          })
          .catch((error) => {
            setIsLoading(false)
            Alert.alert("Error", (error as Error).message || "Failed to load currently reading books")
          })
        getBookRecommendations(token)
          .then((books) => setRecommendedBooks(books.recommendations))
          .catch((error) => {
            console.error("Failed to fetch recommendations:", error);
          });
      } else {
        setIsLoading(false)
      }
    }, [fetchUserProfile, token]),
  )

  const renderReadingProgress = (currentPage: number, totalPages = 300) => {
    const progress = Math.min(Math.max((currentPage / totalPages) * 100, 0), 100)
    return (
      <View className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 mb-3">
        <View className="h-2 bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <SafeAreaView edges={["top"]}>
        {/* Hero Header */}
        <LinearGradient
          colors={["#4f46e5", "#6366f1", "#818cf8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-4 pt-6 pb-8 rounded-b-3xl"
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center">
                <Feather name="book-open" size={20} color="#ffffff" />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-indigo-100">Welcome back,</Text>
                <Text className="text-lg font-bold text-white">{user?.username || "Reader"}</Text>
              </View>
            </View>

            <Pressable className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center">
              <Feather name="bell" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {/* READING GOAL ITEM */}
          <View className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-bold">Your Reading Goal</Text>
              <Text className="text-indigo-100 text-xs">{currentDay} of {totalDaysInMonth} days</Text>
            </View>
            <View className="w-full h-2.5 bg-white/20 rounded-full">
              <View className="h-2.5 bg-white rounded-full" style={{ width: `${(currentDay / totalDaysInMonth) * 100}%` }} />
            </View>
            {/* <Text className="text-indigo-100 text-xs mt-2">You're on a 12-day streak! Keep it up!</Text> */}
            <Text className="text-indigo-100 text-xs mt-2">Keep up the work!</Text>
          </View>

        </LinearGradient>

        {/* Quick Actions */}
        <View className="px-4 mt-6 mb-2">
          <View className="flex-row justify-between">
            <Pressable className="bg-indigo-50 dark:bg-indigo-900 p-3 rounded-xl items-center justify-center flex-1 mr-2">
              <Feather name="search" size={22} color="#6366f1" />
              <Text className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mt-1">Discover</Text>
            </Pressable>
            <Pressable className="bg-indigo-50 dark:bg-indigo-900 p-3 rounded-xl items-center justify-center flex-1 mx-2">
              <Feather name="bookmark" size={22} color="#6366f1" />
              <Text className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mt-1">Bookshelf</Text>
            </Pressable>
            <Pressable className="bg-indigo-50 dark:bg-indigo-900 p-3 rounded-xl items-center justify-center flex-1 ml-2">
              <Feather name="users" size={22} color="#6366f1" />
              <Text className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mt-1">Book Clubs</Text>
            </Pressable>
          </View>
        </View>

        {/* Currently Reading */}
        <View className="px-4 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Currently Reading</Text>
            {currentlyReadingBooks.length > 0 && (
              <Pressable>
                <Text className="text-sm text-indigo-600 dark:text-indigo-400">See All</Text>
              </Pressable>
            )}
          </View>

          {isLoading ? (
            <View className="items-center py-8">
              <View className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <Text className="text-gray-500 dark:text-gray-400 mt-4">Loading your books...</Text>
            </View>
          ) : currentlyReadingBooks.length > 0 ? (
            currentlyReadingBooks.map((entry) => (
              <Pressable
                key={entry.book?.id}
                className="flex-row mb-5 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl shadow-sm"
              >
                <Image
                  source={{ uri: entry.book?.image }}
                  style={{ width: 100, height: 150, borderRadius: 8 }}
                  resizeMode="cover"
                />
                <View className="ml-4 flex-1 justify-center">
                  <Text className="text-base font-bold text-gray-900 dark:text-white mb-1" numberOfLines={2}>
                    {entry.book?.title}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2" numberOfLines={1}>
                    {entry.book?.authors?.[0] || "Unknown Author"}
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <Feather name="book" size={14} color="#6366f1" />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      Page {entry.currentPage || 0} of {entry.book?.pages || 300}
                    </Text>
                  </View>
                  {renderReadingProgress(entry.currentPage || 0, entry.book?.pages)}
                </View>
              </Pressable>
            ))
          ) : (
            <View className="items-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Feather name="book" size={40} color="#6366f1" />
              <Text className="text-gray-700 dark:text-gray-300 mt-3 font-medium">You're not reading anything yet</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mx-6 mt-1 mb-4">
                Discover your next favorite book and start your reading journey
              </Text>
              <Pressable className="py-2.5 px-6 bg-indigo-600 rounded-full">
                <Text className="text-white font-medium">Find Books</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Recommended Books */}
        {/* TODO: THIS WILL BE REPLACED WITH AI SUGGESTIONS */}
        <View className="px-4 pt-2 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Recommended For You</Text>
            <Pressable>
              <Text className="text-sm text-indigo-600 dark:text-indigo-400">See All</Text>
            </Pressable>
          </View>

          {recommendedBooks.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {recommendedBooks.map((book, idx) => (
                <Pressable key={idx} className="mr-4" style={{ width: width * 0.35 }}>
                  <Image
                    source={{ uri: book.image }}
                    style={{ width: "100%", height: 180, borderRadius: 12 }}
                    resizeMode="cover"
                    className="shadow-md"
                  />
                  <View className="mt-2">
                    <Text className="text-sm font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      {book.author}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 items-center">
              <Feather name="zap" size={24} color="#6366f1" />
              <Text className="text-gray-700 dark:text-gray-300 mt-3 font-medium">No recommendations yet</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-3">
                Once you finish a few books, we’ll have suggestions for you.
              </Text>
              <Pressable className="py-2.5 px-6 bg-indigo-600 rounded-full">
                <Text className="text-white font-medium">Start Reading</Text>
              </Pressable>
            </View>
          )}

        </View>

        {/* Book Club Activity */}
        <View className="px-4 pt-2 pb-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Book Club Activity</Text>
          <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 items-center justify-center">
                <Feather name="users" size={18} color="#6366f1" />
              </View>
              <View className="ml-3">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">Fiction Fanatics</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">New discussion started</Text>
              </View>
              <Text className="text-xs text-gray-400 dark:text-gray-500 ml-auto">2h ago</Text>
            </View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              "What did everyone think about the plot twist in chapter 15? I was completely shocked!"
            </Text>
            <Pressable className="py-2 px-4 bg-indigo-100 dark:bg-indigo-900 rounded-full self-start">
              <Text className="text-indigo-700 dark:text-indigo-300 font-medium text-xs">Join Discussion</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}
