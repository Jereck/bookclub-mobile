"use client"

import { useEffect, useState, useCallback } from "react"
import { View, Text, TextInput, ScrollView, Alert, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useAppStore } from "../../store/store"
import {
  getUserProfile,
  updateUserReadingGoal,
  setCurrentlyReading,
  unsetCurrentlyReading,
  getUserLibrary,
} from "../../lib/api"
import { useFocusEffect } from "expo-router"

// Types
interface Book {
  id: number
  title: string
  author?: string
  coverUrl?: string
  image?: string // Fallback if coverUrl is not available
}

interface UserProfile {
  username: string
  email: string
  readingGoal: number
  booksRead: number
  currentlyReading: Book | null
  joinDate: string
  avatar?: string
}

export default function ProfileTab() {
  const logout = useAppStore((state) => state.logout)
  const token = useAppStore((state) => state.token)
  const user = useAppStore((state) => state.user)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [readingGoal, setReadingGoal] = useState("")
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [library, setLibrary] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingGoal, setUpdatingGoal] = useState(false)

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true)
        try {
          const profileData = await getUserProfile(token!)
          setProfile(profileData)
          setReadingGoal(String(profileData.readingGoal || 0))
          setCurrentBook(profileData.currentlyReading)
  
          const books = await getUserLibrary(token!)
          setLibrary(books)
        } catch (err) {
          Alert.alert("Error", (err as Error).message)
        } finally {
          setLoading(false)
        }
      }
  
      loadData()
    }, [token])
  );

  // useEffect(() => {
  //   const loadData = async () => {
  //     setLoading(true)
  //     try {
  //       // Load profile data
  //       const profileData = await getUserProfile(token!)
  //       setProfile(profileData)
  //       setReadingGoal(String(profileData.readingGoal || 0))
  //       setCurrentBook(profileData.currentlyReading)

  //       // Load library data
  //       const books = await getUserLibrary(token!)
  //       setLibrary(books)
  //     } catch (err) {
  //       Alert.alert("Error", (err as Error).message)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   loadData()
  // }, [token])

  const handleGoalUpdate = async () => {
    if (!readingGoal.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid reading goal")
      return
    }

    try {
      setUpdatingGoal(true)
      await updateUserReadingGoal(token!, Number(readingGoal))

      // Update local profile data
      if (profile) {
        setProfile({
          ...profile,
          readingGoal: Number(readingGoal),
        })
      }

      Alert.alert("Success", "Your reading goal was updated!")
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setUpdatingGoal(false)
    }
  }

  const handleSetReading = async (bookId: number) => {
    try {
      await setCurrentlyReading(token!, bookId)
      const book = library.find((b) => b.id === bookId)
      if (!book) throw new Error("Book not found in library")
      setCurrentBook(book)

      // Update local profile data
      if (profile) {
        setProfile({
          ...profile,
          currentlyReading: book,
        })
      }

      Alert.alert("Updated", `You're now reading "${book.title}"`)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    }
  }

  const handleUnset = async () => {
    try {
      await unsetCurrentlyReading(token!)
      setCurrentBook(null)

      // Update local profile data
      if (profile) {
        setProfile({
          ...profile,
          currentlyReading: null,
        })
      }
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 px-4">
        {/* Profile Header */}
        <View className="py-6 items-center">
          <View className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4 overflow-hidden">
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Feather name="user" size={40} color="#6366f1" />
              </View>
            )}
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username || "Reader"}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</Text>

          <View className="flex-row mt-4 space-x-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.booksRead || 0}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Books Read</Text>
            </View>
            <View className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{library.length}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">In Library</Text>
            </View>
            <View className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.readingGoal || 0}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Goal</Text>
            </View>
          </View>
        </View>

        {/* Content Sections */}
        <View className="flex-1">
          <ScrollView contentContainerStyle={{ paddingBottom: 65 }} showsVerticalScrollIndicator={false}>
            <View>
                {/* Reading Goal Section */}
                <View className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                      <Feather name="target" size={20} color="#6366f1" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Reading Goal</Text>
                  </View>

                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    How many books do you want to read this year?
                  </Text>

                  <View className="flex-row items-center">
                    <View className="flex-1 mr-3">
                      <TextInput
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white"
                        value={readingGoal}
                        onChangeText={setReadingGoal}
                        keyboardType="numeric"
                        placeholder="Enter your goal"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                    <TouchableOpacity
                      onPress={handleGoalUpdate}
                      disabled={updatingGoal}
                      className={`px-4 py-2.5 rounded-lg ${updatingGoal ? "bg-indigo-400" : "bg-indigo-600"}`}
                    >
                      <Text className="text-white font-medium">Update</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Progress Bar */}
                  <View className="mt-4">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-gray-500 dark:text-gray-400">Progress</Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {profile?.booksRead || 0}/{profile?.readingGoal || 0} books
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-indigo-600 rounded-full"
                        style={{
                          width: `${
                            profile?.readingGoal
                              ? Math.min(100, ((profile?.booksRead || 0) / profile.readingGoal) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Currently Reading Section */}
                <View className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                      <Feather name="book-open" size={20} color="#6366f1" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Currently Reading</Text>
                  </View>

                  {currentBook ? (
                    <View className="flex-row items-center">
                      <View className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden mr-3">
                        {currentBook.coverUrl || currentBook.image ? (
                          <Image
                            source={{ uri: currentBook.coverUrl || currentBook.image }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full items-center justify-center">
                            <Feather name="book" size={24} color="#9ca3af" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-medium text-gray-900 dark:text-white" numberOfLines={2}>
                          {currentBook.title}
                        </Text>
                        {currentBook.author && (
                          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">{currentBook.author}</Text>
                        )}
                        <TouchableOpacity onPress={handleUnset} className="flex-row items-center">
                          <Feather name="x-circle" size={14} color="#6366f1" />
                          <Text className="ml-1 text-sm text-indigo-600 dark:text-indigo-400">Clear</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View className="items-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Feather name="book" size={32} color="#9ca3af" />
                      <Text className="text-gray-500 dark:text-gray-400 mt-2">Not reading anything right now</Text>
                    </View>
                  )}
                </View>

                {/* Library Section */}
                <View className="mb-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                        <Feather name="bookmark" size={20} color="#6366f1" />
                      </View>
                      <Text className="text-lg font-bold text-gray-900 dark:text-white">Your Library</Text>
                    </View>
                    <TouchableOpacity>
                      <Text className="text-sm text-indigo-600 dark:text-indigo-400">View All</Text>
                    </TouchableOpacity>
                  </View>

                  {library.length > 0 ? (
                    <View>
                      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Select a book to start reading
                      </Text>
                      {library.slice(0, 3).map((book) => (
                        <TouchableOpacity
                          key={book.id}
                          onPress={() => handleSetReading(book.id)}
                          className="flex-row items-center p-3 bg-white dark:bg-gray-800 rounded-lg mb-2 border border-gray-100 dark:border-gray-700"
                        >
                          <View style={{ width: 48, height: 72 }} className="bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-3">
                            {book.coverUrl || book.image ? (
                              <Image
                                source={{ uri: book.coverUrl || book.image }}
                                className="w-full h-full"
                                resizeMode="cover"
                              />
                            ) : (
                              <View className="w-full h-full items-center justify-center">
                                <Feather name="book" size={18} color="#9ca3af" />
                              </View>
                            )}
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                              {book.title}
                            </Text>
                            {book.author && (
                              <Text className="text-sm text-gray-500 dark:text-gray-400">{book.author}</Text>
                            )}
                          </View>
                          <Feather name="chevron-right" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                      ))}

                      {library.length > 3 && (
                        <TouchableOpacity className="items-center py-3">
                          <Text className="text-indigo-600 dark:text-indigo-400">See More Books</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View className="items-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Feather name="book" size={32} color="#9ca3af" />
                      <Text className="text-gray-500 dark:text-gray-400 mt-2">Your library is empty</Text>
                      <TouchableOpacity className="mt-3 px-4 py-2 bg-indigo-600 rounded-lg">
                        <Text className="text-white font-medium">Add Books</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Account Section */}
                <View className="mb-12 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                      <Feather name="settings" size={20} color="#6366f1" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Account</Text>
                  </View>

                  <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center">
                      <Feather name="user" size={18} color="#6366f1" className="mr-3" />
                      <Text className="text-gray-800 dark:text-gray-200">Edit Profile</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#9ca3af" />
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center">
                      <Feather name="bell" size={18} color="#6366f1" className="mr-3" />
                      <Text className="text-gray-800 dark:text-gray-200">Notifications</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#9ca3af" />
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center">
                      <Feather name="shield" size={18} color="#6366f1" className="mr-3" />
                      <Text className="text-gray-800 dark:text-gray-200">Privacy & Security</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#9ca3af" />
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-row items-center justify-between py-3">
                    <View className="flex-row items-center">
                      <Feather name="help-circle" size={18} color="#6366f1" className="mr-3" />
                      <Text className="text-gray-800 dark:text-gray-200">Help & Support</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                  onPress={logout}
                  className="mb-8 py-3 rounded-lg border border-red-200 dark:border-red-800 flex-row items-center justify-center"
                >
                  <Feather name="log-out" size={18} color="#ef4444" />
                  <Text className="ml-2 text-red-600 dark:text-red-400 font-medium">Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}
