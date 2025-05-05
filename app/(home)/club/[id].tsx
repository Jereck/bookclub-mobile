"use client"

import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Alert,
  TouchableOpacity,
  TextInput,
  Animated,
  RefreshControl,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useAppStore } from "../../../store/store"
import {
  getBookClubDetails,
  getUserBookshelf,
  sendBookClubInvite,
  setClubCurrentBook,
  searchUserByEmail,
} from "../../../lib/api"
import type { Book, BookClub, User } from "../../../lib/api/types"
import BookSearchAndAdd from "../../../components/BookSearchAndAdd"
import { useFocusEffect } from "@react-navigation/native"
import { MemberCountBadge } from "../../../components/MemberCountBadge"
import { MemberItem } from "../../../components/MemberItem"
import { CurrentBookCard } from "../../../components/CurrentBookCard"
import { NoBookCard } from "../../../components/NoBookCard"

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const token = useAppStore((state) => state.token)
  const user = useAppStore((state) => state.user)
  const [library, setLibrary] = useState<Book[]>([])
  const [settingBook, setSettingBook] = useState(false)
  const [club, setClub] = useState<BookClub | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showBookSelector, setShowBookSelector] = useState(false)

  const [inviteEmail, setInviteEmail] = useState("")
  const [searching, setSearching] = useState(false)
  const [foundUser, setFoundUser] = useState<User | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)

  const scrollY = new Animated.Value(0)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getBookClubDetails(token!, Number(id))
      const libraryData = await getUserBookshelf(token!)
      setLibrary(libraryData)
      setClub(data)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id, token])

  useEffect(() => {
    if (id) loadDetails()
  }, [id, loadDetails])

  useFocusEffect(
    useCallback(() => {
      if (id) loadDetails()
    }, [id, loadDetails]),
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadDetails()
  }, [loadDetails])

  const handleSearchUser = async () => {
    if (!inviteEmail.trim()) return
    try {
      setSearching(true)
      const user = await searchUserByEmail(token!, inviteEmail)
      setFoundUser(user)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
      setFoundUser(null)
    } finally {
      setSearching(false)
    }
  }

  const handleSendInvite = async () => {
    if (!foundUser) return
    try {
      setSendingInvite(true)
      await sendBookClubInvite(token!, Number(id), foundUser.id)
      Alert.alert("Success", `${foundUser.username} has been invited`)
      setInviteEmail("")
      setFoundUser(null)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setSendingInvite(false)
    }
  }

  const handleSetBook = async (bookId: number) => {
    try {
      if (!club) return
      setSettingBook(true)
      await setClubCurrentBook(token!, club.id, bookId)
      Alert.alert("Success", "Book set as current club read!")
      const updated = await getBookClubDetails(token!, club.id)
      setClub(updated)
      setShowBookSelector(false)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setSettingBook(false)
    }
  }

  const isOwner = user?.id === club?.ownerId

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Loading club details...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 mb-16 bg-white dark:bg-gray-900">
      {/* Floating Header */}
      <Animated.View
        style={{ opacity: headerOpacity }}
        className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      >
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-4 py-2">
            <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Feather name="arrow-left" size={20} color="#6366f1" />
            </Pressable>
            <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {club?.name || "Book Club"}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.FlatList
        data={club?.members || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MemberItem member={item} isOwner={item.id === club?.ownerId} />}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} />}
        ListHeaderComponent={
          <>
            {/* Club Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center"
              >
                <Feather name="arrow-left" size={20} color="#6366f1" />
              </Pressable>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">{club?.name || "Book Club"}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Created {new Date(club?.created_at || "").toLocaleDateString()}
                </Text>
              </View>
              <View className="relative w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
                <Feather name="users" size={20} color="#6366f1" />
                <MemberCountBadge count={club?.members?.length || 0} />
              </View>
            </View>

            {/* Current Book or No Book Card */}
            {club?.currentBook ? (
              <CurrentBookCard
                book={club.currentBook}
                onPress={() => club.currentBook?.id && router.push(`/books/${club.currentBook.id}`)}
              />
            ) : (
              <NoBookCard onPress={() => setShowBookSelector(true)} isOwner={isOwner} />
            )}

            {/* Invite Member Section */}
            <View className="mt-6">
              <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">Invite Member</Text>

              <View className="flex-row items-center border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-800">
                <Feather name="mail" size={18} color="#9ca3af" className="mr-2" />
                <TextInput
                  placeholder="Enter email address"
                  className="flex-1 text-gray-900 dark:text-white"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  onPress={handleSearchUser}
                  disabled={searching || !inviteEmail.trim()}
                  className={`p-2 rounded-lg ${!inviteEmail.trim() ? "bg-gray-200 dark:bg-gray-700" : "bg-indigo-600"}`}
                >
                  {searching ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Feather name="search" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Found User Card */}
              {foundUser && (
                <Animated.View
                  className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                  // entering={Animated.FadeInUp.duration(300)}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-3">
                      <Feather name="user-check" size={16} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900 dark:text-white">{foundUser.username}</Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">{foundUser.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleSendInvite}
                      disabled={sendingInvite}
                      className="px-4 py-2 bg-indigo-600 rounded-lg"
                    >
                      {sendingInvite ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-white font-medium">Invite</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Book Selector Section */}
            {showBookSelector && (
              <Animated.View className="mt-6" 
              // entering={Animated.FadeInDown.duration(300)}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-bold text-gray-800 dark:text-white">Select a Book</Text>
                  <TouchableOpacity onPress={() => setShowBookSelector(false)}>
                    <Feather name="x" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* <BookSearchAndAdd token={token!} onAdd={handleSetBook} buttonLabel="Set as Club Book" /> */}
              </Animated.View>
            )}

            {/* Members Section Header */}
            <View className="mt-6 mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-800 dark:text-white">Members</Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-sm text-indigo-600 dark:text-indigo-400 mr-1">View All</Text>
                <Feather name="chevron-right" size={16} color="#6366f1" />
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="py-8 items-center justify-center">
            <Feather name="users" size={40} color="#9ca3af" />
            <Text className="mt-4 text-gray-500 dark:text-gray-400 text-center">No members found</Text>
          </View>
        }
      />

      {/* Set Book FAB for club owner */}
      {/* {isOwner && !showBookSelector && (
        <TouchableOpacity
          onPress={() => setShowBookSelector(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
          style={{ elevation: 5 }}
        >
          <Feather name="book" size={24} color="white" />
        </TouchableOpacity>
      )} */}
    </SafeAreaView>
  )
}
