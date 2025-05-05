"use client"

import { useState, useCallback } from "react"
import { View, Text, TextInput, ScrollView, Alert, Image, Pressable, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useAppStore } from "../../store/store"
import {
  getUserProfile,
  updateUserReadingGoal,
  getCurrentlyReadingBooks,
  getUserBookshelf,
  getBookClubInvites,
  acceptBookClubInvite,
} from "../../lib/api"
import { useFocusEffect } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import type { Invite } from "../../lib/api/types"

interface Book {
  id: number
  title: string
  authors: string[]
  image: string
  isbn13: string
  pages: number
  synopsis: string
  datePublished: string
}

interface BookshelfEntry {
  id: number
  book: Book
  currentPage: number
  rating: number | null
  read: boolean
  addedAt: string
}

interface UserProfile {
  id: number
  username: string
  email: string
  readingGoal: number
  booksRead: number
  currentlyReading: BookshelfEntry | null
  avatar?: string
}

export default function ProfileTab() {
  const logout = useAppStore((state) => state.logout)
  const token = useAppStore((state) => state.token)
  const user = useAppStore((state) => state.user)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [readingGoal, setReadingGoal] = useState("")
  const [currentEntry, setCurrentEntry] = useState<BookshelfEntry | null>(null)
  const [currentlyReading, setCurrentlyReading] = useState<BookshelfEntry[]>([])
  const [library, setLibrary] = useState<BookshelfEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingGoal, setUpdatingGoal] = useState(false)
  const [invites, setInvites] = useState<Invite[]>([])
  const [invitesLoading, setInvitesLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      if (!token) return

      const loadData = async () => {
        setLoading(true)
        try {
          const profileData = await getUserProfile(token!)
          setProfile(profileData)
          setReadingGoal(String(profileData.readingGoal || 0))
          setCurrentEntry(profileData.currentlyReading)

          const [books, reading] = await Promise.all([getUserBookshelf(token!), getCurrentlyReadingBooks(token!)])

          setLibrary(books)
          setCurrentlyReading(reading)
          loadInvites()
        } catch (err) {
          Alert.alert("Error", (err as Error).message)
        } finally {
          setLoading(false)
        }
      }

      loadData()
    }, [token]),
  )

  const handleGoalUpdate = async () => {
    if (!readingGoal.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid reading goal")
      return
    }

    try {
      setUpdatingGoal(true)
      await updateUserReadingGoal(token!, Number(readingGoal))

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

  const loadInvites = async () => {
    try {
      setInvitesLoading(true)
      const data = await getBookClubInvites(token!)
      setInvites(data)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setInvitesLoading(false)
    }
  }

  const handleAcceptInvite = async (inviteId: number, clubName: string) => {
    try {
      await acceptBookClubInvite(token!, inviteId)
      Alert.alert("Success", `You've joined ${clubName}`)
      const updated = await getBookClubInvites(token!)
      setInvites(updated)
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

  const progressPercentage = profile?.readingGoal
    ? Math.min(100, ((profile?.booksRead || 0) / profile.readingGoal) * 100)
    : 0

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView edges={["top"]}>
        {/* Profile Header */}
        <LinearGradient
          colors={["#4f46e5", "#6366f1", "#818cf8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-4 pt-8 pb-16 items-center"
        >
          <View className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg mb-4 overflow-hidden border-2 border-white/30">
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Feather name="user" size={40} color="#ffffff" />
              </View>
            )}
          </View>
          <Text className="text-2xl font-bold text-white">{user?.username || "Reader"}</Text>
          <Text className="text-sm text-indigo-100 mt-1">{user?.email}</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View className="px-4 -mt-10">
          <View className="flex-row justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.booksRead || 0}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Books Read</Text>
            </View>
            <View className="h-14 w-px bg-gray-200 dark:bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{library.length}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">In Library</Text>
            </View>
            <View className="h-14 w-px bg-gray-200 dark:bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.readingGoal || 0}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Goal</Text>
            </View>
          </View>
        </View>

        {/* Content Sections */}
        <View className="px-4 mt-6">
          {/* Reading Goal Section */}
          <View className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                <Feather name="target" size={20} color="#6366f1" />
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Reading Goal</Text>
            </View>

            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              How many books do you want to read this year?
            </Text>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 mr-3">
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                  value={readingGoal}
                  onChangeText={setReadingGoal}
                  keyboardType="numeric"
                  placeholder="Enter your goal"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <Pressable
                onPress={handleGoalUpdate}
                disabled={updatingGoal}
                className={`px-5 py-3 rounded-lg ${updatingGoal ? "bg-indigo-400" : "bg-indigo-600"}`}
              >
                {updatingGoal ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-medium">Update</Text>
                )}
              </Pressable>
            </View>

            {/* Progress Bar */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">Progress</Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {profile?.booksRead || 0}/{profile?.readingGoal || 0} books
                </Text>
              </View>
              <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <View className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPercentage}%` }} />
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                {progressPercentage.toFixed(0)}% complete
              </Text>
            </View>
          </View>

          {/* Currently Reading Section */}
          <View className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                  <Feather name="book-open" size={20} color="#6366f1" />
                </View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Currently Reading</Text>
              </View>
              {currentlyReading.length > 0 && (
                <Pressable>
                  <Text className="text-sm text-indigo-600 dark:text-indigo-400">See All</Text>
                </Pressable>
              )}
            </View>

            {currentlyReading.length > 0 ? (
              currentlyReading.map((entry) => (
                <Pressable key={entry.book.id} className="flex-row bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-3">
                  <View className="w-16 h-24 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden mr-3">
                    {entry.book.image ? (
                      <Image source={{ uri: entry.book.image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Feather name="book" size={24} color="#9ca3af" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1 justify-center">
                    <Text className="text-base font-medium text-gray-900 dark:text-white" numberOfLines={2}>
                      {entry.book.title}
                    </Text>
                    {entry.book.authors && (
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">{entry.book.authors[0]}</Text>
                    )}
                    <View className="flex-row items-center mb-1">
                      <Feather name="book" size={14} color="#6366f1" />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        Page {entry.currentPage || 0} of {entry.book.pages || 300}
                      </Text>
                    </View>
                    <View className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                      <View
                        className="h-1.5 bg-indigo-600 rounded-full"
                        style={{
                          width: `${Math.min(100, ((entry.currentPage || 0) / (entry.book.pages || 300)) * 100)}%`,
                        }}
                      />
                    </View>
                  </View>
                </Pressable>
              ))
            ) : (
              <View className="items-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Feather name="book" size={36} color="#6366f1" />
                <Text className="text-gray-700 dark:text-gray-300 mt-3 font-medium">
                  Not reading anything right now
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mx-6 mt-1 mb-4">
                  Start reading a book from your library
                </Text>
                <Pressable className="py-2.5 px-6 bg-indigo-600 rounded-full">
                  <Text className="text-white font-medium">Find Books</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Library Section */}
          <View className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                  <Feather name="bookmark" size={20} color="#6366f1" />
                </View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Your Library</Text>
              </View>
              {library.length > 0 && (
                <Pressable>
                  <Text className="text-sm text-indigo-600 dark:text-indigo-400">View All</Text>
                </Pressable>
              )}
            </View>

            {library.length > 0 ? (
              <View>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select a book to start reading</Text>
                {library.slice(0, 3).map((entry) => (
                  <Pressable
                    key={entry.book.id}
                    className="flex-row items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-2"
                  >
                    <View
                      style={{ width: 48, height: 72 }}
                      className="bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden mr-3"
                    >
                      {entry.book.image ? (
                        <Image source={{ uri: entry.book.image }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Feather name="book" size={18} color="#9ca3af" />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                        {entry.book.title}
                      </Text>
                      {entry.book.authors && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400">{entry.book.authors[0]}</Text>
                      )}
                      {entry.rating && (
                        <View className="flex-row items-center mt-1">
                          <Feather name="star" size={12} color="#f59e0b" />
                          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{entry.rating}/5</Text>
                        </View>
                      )}
                    </View>
                    <Feather name="chevron-right" size={20} color="#9ca3af" />
                  </Pressable>
                ))}

                {library.length > 3 && (
                  <Pressable className="items-center py-3 mt-1 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Text className="text-indigo-600 dark:text-indigo-400 font-medium">See More Books</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View className="items-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Feather name="book" size={36} color="#6366f1" />
                <Text className="text-gray-700 dark:text-gray-300 mt-3 font-medium">Your library is empty</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mx-6 mt-1 mb-4">
                  Add books to your library to keep track of what you want to read
                </Text>
                <Pressable className="py-2.5 px-6 bg-indigo-600 rounded-full">
                  <Text className="text-white font-medium">Add Books</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Pending Invites */}
          <View className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                <Feather name="users" size={20} color="#6366f1" />
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Book Club Invites</Text>
            </View>

            {invitesLoading ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#6366f1" />
                <Text className="text-gray-500 dark:text-gray-400 mt-2">Loading invites...</Text>
              </View>
            ) : invites.length === 0 ? (
              <View className="items-center py-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Feather name="mail" size={32} color="#6366f1" />
                <Text className="text-gray-700 dark:text-gray-300 mt-3">No pending invites</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mx-6 mt-1">
                  When someone invites you to a book club, you'll see it here
                </Text>
              </View>
            ) : (
              invites.map((invite: Invite) => (
                <View key={invite.id} className="mb-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 items-center justify-center mr-2">
                      <Feather name="users" size={16} color="#6366f1" />
                    </View>
                    <View>
                      <Text className="text-base font-medium text-gray-900 dark:text-white">{invite.bookClubName}</Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">Invitation to join</Text>
                    </View>
                  </View>
                  <View className="flex-row mt-3">
                    <Pressable
                      onPress={() => handleAcceptInvite(invite.id, invite.bookClubName!)}
                      className="flex-1 py-2 bg-indigo-600 rounded-lg items-center mr-2"
                    >
                      <Text className="text-white font-medium">Accept</Text>
                    </Pressable>
                    <Pressable className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg items-center ml-2">
                      <Text className="text-gray-700 dark:text-gray-200 font-medium">Decline</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Account Section */}
          <View className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                <Feather name="settings" size={20} color="#6366f1" />
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Account Settings</Text>
            </View>

            <Pressable className="flex-row items-center justify-between py-3.5 border-b border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900 items-center justify-center mr-3">
                  <Feather name="user" size={16} color="#6366f1" />
                </View>
                <Text className="text-gray-800 dark:text-gray-200">Edit Profile</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between py-3.5 border-b border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900 items-center justify-center mr-3">
                  <Feather name="bell" size={16} color="#6366f1" />
                </View>
                <Text className="text-gray-800 dark:text-gray-200">Notifications</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between py-3.5 border-b border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900 items-center justify-center mr-3">
                  <Feather name="shield" size={16} color="#6366f1" />
                </View>
                <Text className="text-gray-800 dark:text-gray-200">Privacy & Security</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between py-3.5">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900 items-center justify-center mr-3">
                  <Feather name="help-circle" size={16} color="#6366f1" />
                </View>
                <Text className="text-gray-800 dark:text-gray-200">Help & Support</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Logout Button */}
          <Pressable
            onPress={logout}
            className="mb-8 py-3.5 rounded-xl border border-red-200 dark:border-red-800 flex-row items-center justify-center bg-white dark:bg-gray-800"
          >
            <Feather name="log-out" size={18} color="#ef4444" />
            <Text className="ml-2 text-red-600 dark:text-red-400 font-medium">Logout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}
