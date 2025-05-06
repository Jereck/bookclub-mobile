"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "expo-router"
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Keyboard,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { getBookClubs, createBookClub } from "@/lib/api"
import { useAppStore } from "@/store/store"
import { Feather } from "@expo/vector-icons"
import type { BookClub } from "@/lib/api/types"
import { useFocusEffect } from "@react-navigation/native"

// Club card component with animation
const ClubCard = ({
  club,
  onPress,
  index,
}: {
  club: BookClub
  onPress: () => void
  index: number
}) => {
  // Generate a random pastel color for the club icon
  const getClubColor = (id: number) => {
    const colors = [
      "#FDE68A", // amber-200
      "#A7F3D0", // emerald-200
      "#BAE6FD", // sky-200
      "#C7D2FE", // indigo-200
      "#DDD6FE", // violet-200
      "#FBCFE8", // pink-200
    ]
    return colors[id % colors.length]
  }

  // Get first letter of each word in club name for the icon
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Animated.View 
      // entering={Animated.FadeInUp.delay(index * 100).duration(400)} 
      className="mb-3">
      <Pressable
        onPress={onPress}
        className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: getClubColor(club.id) }}
          >
            <Text className="text-lg font-bold text-gray-800">{getInitials(club.name)}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">{club.name}</Text>

            <View className="flex-row items-center mt-1">
              <Feather name="users" size={14} color="#9ca3af" />
              <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400">{club.memberCount || "0"} members</Text>

              {club.currentBook && (
                <>
                  <View className="mx-2 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <Feather name="book-open" size={14} color="#9ca3af" />
                  <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
                    {club.currentBook.title}
                  </Text>
                </>
              )}
            </View>
          </View>

          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </View>
      </Pressable>
    </Animated.View>
  )
}

// Empty state component
const EmptyState = ({ onCreatePress }: { onCreatePress: () => void }) => (
  <Animated.View
    className="flex-1 items-center justify-center py-10"
    // entering={Animated.FadeIn.delay(300).duration(400)}
  >
    <View className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mb-4">
      <Feather name="users" size={28} color="#6366f1" />
    </View>

    <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">No Book Clubs Yet</Text>

    <Text className="text-base text-gray-500 dark:text-gray-400 mb-6 text-center px-6">
      Create your first book club or join one to start reading with friends
    </Text>

    <TouchableOpacity onPress={onCreatePress} className="px-6 py-3 bg-indigo-600 rounded-lg flex-row items-center">
      <Feather name="plus" size={18} color="white" />
      <Text className="ml-2 text-white font-medium">Create a Book Club</Text>
    </TouchableOpacity>
  </Animated.View>
)

// Create club modal component
const CreateClubForm = ({
  visible,
  clubName,
  setClubName,
  onSubmit,
  onCancel,
  creating,
}: {
  visible: boolean
  clubName: string
  setClubName: (name: string) => void
  onSubmit: () => void
  onCancel: () => void
  creating: boolean
}) => {
  if (!visible) return null

  return (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg p-5 z-10"
      // entering={Animated.SlideInUp.duration(300)}
      // exiting={Animated.SlideOutDown.duration(200)}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Create New Club</Text>
        <TouchableOpacity onPress={onCancel} className="p-2">
          <Feather name="x" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Give your book club a name that reflects what you'll be reading together.
      </Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name</Text>
        <TextInput
          value={clubName}
          onChangeText={setClubName}
          placeholder="e.g., Science Fiction Lovers"
          placeholderTextColor="#9ca3af"
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          autoFocus
        />
      </View>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg items-center"
        >
          <Text className="font-medium text-gray-700 dark:text-gray-300">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={creating || !clubName.trim()}
          className={`flex-1 py-3 rounded-lg items-center ${!clubName.trim() ? "bg-indigo-400" : "bg-indigo-600"}`}
        >
          {creating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="font-medium text-white">Create Club</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

export default function ClubTab() {
  const router = useRouter()
  const token = useAppStore((state) => state.token)

  const [clubs, setClubs] = useState<BookClub[]>([])
  const [clubName, setClubName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadClubs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getBookClubs(token!)
      setClubs(data)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  console.log("Clubs:", clubs)

  const handleCreateClub = async () => {
    if (!clubName.trim()) return

    try {
      setCreating(true)
      await createBookClub(token!, clubName.trim())
      setClubName("")
      setShowCreateForm(false)
      Keyboard.dismiss()
      await loadClubs()

      // Show success message
      Alert.alert("Success", `Your book club "${clubName.trim()}" has been created!`, [{ text: "OK" }])
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadClubs()
  }, [loadClubs])

  useEffect(() => {
    loadClubs()
  }, [loadClubs])

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadClubs()
    }, [loadClubs]),
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Book Clubs</Text>

          <TouchableOpacity
            onPress={() => setShowCreateForm(true)}
            className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center"
          >
            <Feather name="plus" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 dark:text-gray-400 mt-1">Join or create book clubs to read with friends</Text>
      </View>

      {/* Clubs List */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading your book clubs...</Text>
        </View>
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={(item: BookClub) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 40,
            flexGrow: clubs.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} />}
          renderItem={({ item, index }) => (
            <ClubCard club={item} index={index} onPress={() => router.push(`/club/${item.id}`)} />
          )}
          ListEmptyComponent={<EmptyState onCreatePress={() => setShowCreateForm(true)} />}
        />
      )}

      {/* Create Club Form */}
      <CreateClubForm
        visible={showCreateForm}
        clubName={clubName}
        setClubName={setClubName}
        onSubmit={handleCreateClub}
        onCancel={() => {
          setShowCreateForm(false)
          setClubName("")
        }}
        creating={creating}
      />
    </SafeAreaView>
  )
}
