"use client"

import React from "react"
import RenderHTML from "react-native-render-html"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  Animated,
  TouchableOpacity,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useWindowDimensions } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useAppStore } from "@/store/store"
import {
  getBookshelfEntry,
  markAsCurrentlyReading,
  unmarkCurrentlyReading,
  updateBookshelfEntry,
} from "@/lib/api"
import type { Book, BookshelfEntry } from "@/lib/api/types"
import { useFocusEffect } from "@react-navigation/native"

// Star Rating Component with interactive capability
const StarRating = ({
  rating = 0,
  size = 16,
  interactive = false,
  onRatingChange,
}: {
  rating: number
  size?: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}) => {
  const stars = [1, 2, 3, 4, 5]

  return (
    <View className="flex-row">
      {stars.map((star) => (
        <TouchableOpacity
          key={`star-${star}`}
          disabled={!interactive}
          onPress={() => interactive && onRatingChange && onRatingChange(star)}
          className="pr-1"
        >
          <Feather
            name={rating >= star ? "star" : "star"}
            size={size}
            color={rating >= star ? "#F59E0B" : "#D1D5DB"}
            style={rating >= star ? {} : { opacity: 0.7 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  )
}

// Book Action Button Component with improved feedback
const BookActionButton = ({
  icon,
  label,
  onPress,
  primary = false,
  loading = false,
}: {
  icon: string
  label: string
  onPress: () => void
  primary?: boolean
  loading?: boolean
}) => {
  const [pressed, setPressed] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
        primary
          ? pressed
            ? "bg-indigo-700"
            : "bg-indigo-600"
          : pressed
            ? "bg-gray-200 dark:bg-gray-700"
            : "bg-gray-100 dark:bg-gray-800"
      }`}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={primary ? "white" : "#6366f1"} />
      ) : (
        <>
          <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color={primary ? "white" : "#6366f1"} />
          <Text
            className={`ml-2 text-sm font-medium ${primary ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

// Info Item Component with improved layout
const InfoItem = ({ label, value }: { label: string; value: string | number }) => (
  <View className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800">
    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 w-28">{label}</Text>
    <Text className="text-sm text-gray-900 dark:text-white flex-1">{value}</Text>
  </View>
)

export default function BookDetail() {
  const { width } = useWindowDimensions()
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const token = useAppStore((state) => state.token)
  const [book, setBook] = useState<Book | null>(null)
  const [entry, setEntry] = useState<BookshelfEntry | null>(null)
  const [currentPage, setCurrentPage] = useState("0")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedSynopsis, setExpandedSynopsis] = useState(false)
  const scrollY = new Animated.Value(0)

  const loadBook = useCallback(async () => {
    try {
      setLoading(true)
      const entry = await getBookshelfEntry(token!, Number(id))
      if (!entry || !entry.book) throw new Error("Book not found")

      setEntry(entry)
      setCurrentPage(entry.currentPage.toString())
      setBook(entry.book)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id, token])

  useEffect(() => {
    if (id) loadBook()
  }, [id, loadBook])

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id) loadBook()
    }, [id, loadBook]),
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadBook()
  }, [loadBook])

  const updateReadingStatus = async (reading: boolean) => {
    try {
      setActionLoading(true)
      if (!entry || !entry.book?.id) throw new Error("Book entry or ID is undefined")

      if (reading) {
        await markAsCurrentlyReading(token!, entry.book.id)
      } else {
        await unmarkCurrentlyReading(token!, entry.book.id)
      }

      setEntry({ ...entry, currentlyReading: reading })
      Alert.alert("Updated", reading ? "You've started reading this book." : "You've stopped reading this book.")
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  const updatePageNumber = async () => {
    try {
      setActionLoading(true)
      const page = Number.parseInt(currentPage)
      if (isNaN(page) || page < 0) throw new Error("Invalid page number")
      if (book?.pages && page > book.pages) throw new Error("Page number exceeds total pages")
      if (!entry || !entry.book?.id) throw new Error("Book entry or ID is undefined")

      const updated = await updateBookshelfEntry(token!, entry.book.id, { currentPage: page })
      setEntry(updated)
      Alert.alert("Updated", `You're now on page ${page}`)
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  const updateReadStatus = async (read: boolean) => {
    try {
      setActionLoading(true)
      if (!entry || !entry.book?.id) throw new Error("Book entry or ID is undefined")

      const updated = await updateBookshelfEntry(token!, entry.book.id, {
        read: read,
        currentPage: read ? book?.pages || 0 : 0,
      })

      setEntry(updated)
      setCurrentPage(read ? String(book?.pages || 0) : "0")
      Alert.alert(
        read ? "Great job!" : "Updated",
        read ? "You've finished reading this book." : "You've marked this book as unread.",
      )
    } catch (err) {
      Alert.alert("Error", (err as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  // Header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <View className="items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400">Loading book details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!book) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <Feather name="book-open" size={48} color="#9CA3AF" />
        <Text className="text-xl font-medium text-gray-500 dark:text-gray-400 mt-4">Book not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 py-2.5 px-5 bg-indigo-600 rounded-lg flex-row items-center"
        >
          <Feather name="arrow-left" size={16} color="white" />
          <Text className="ml-2 text-white font-medium">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 mb-16">
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
              {book.title}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} />}
      >
        {/* Book Cover with Gradient Overlay */}
        <View className="w-full h-80 bg-gray-100 dark:bg-gray-800">
          <Image source={{ uri: book.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />

          {/* Back button overlay */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-sm"
          >
            <Feather name="arrow-left" size={20} color="white" />
          </Pressable>
        </View>

        {/* Book Info Card */}
        <View className="px-4 -mt-16">
          <View className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-4">
            <View className="flex-row">
              {/* Book Cover Thumbnail */}
              <Image
                source={{ uri: book.image }}
                style={{ width: width * 0.25, height: width * 0.4, borderRadius: 8 }}
                resizeMode="cover"
                className="shadow-sm"
              />

              {/* Book Details */}
              <View className="ml-4 flex-1 justify-center">
                <Text className="text-xl font-bold text-gray-900 dark:text-white" numberOfLines={2}>
                  {book.title}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2">
                  {book.authors?.join(", ") || "Unknown Author"}
                </Text>

                <View className="flex-row items-center mb-2">
                  <StarRating rating={book.rating || 0} size={18} interactive={false} />
                  <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {book.rating?.toFixed(1) || "0.0"}
                  </Text>
                </View>

                {entry?.currentPage !== undefined && book.pages ? (
                  <View className="w-full mt-1">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Page {entry.currentPage} of {book.pages}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor((entry.currentPage / book.pages) * 100)}%
                      </Text>
                    </View>
                    <View className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className={`h-full ${entry.currentPage >= book.pages ? "bg-green-500" : "bg-indigo-600"} rounded-full`}
                        style={{
                          width: `${Math.min(100, (entry.currentPage / book.pages) * 100)}%`,
                        }}
                      />
                    </View>
                  </View>
                ) : null}

                <View className="flex-row flex-wrap mt-2">
                  {book.subjects?.slice(0, 2).map((subject, index) => (
                    <View key={index} className="bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full mr-2 mb-1">
                      <Text className="text-xs text-indigo-600 dark:text-indigo-400">{subject}</Text>
                    </View>
                  ))}
                  {(book.subjects?.length || 0) > 2 && (
                    <View className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                      <Text className="text-xs text-gray-600 dark:text-gray-300">
                        +{(book.subjects?.length || 0) - 2}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Reading Status Indicator */}
            {entry?.currentlyReading && (
              <View className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg flex-row items-center">
                <Feather name="book-open" size={16} color="#6366f1" />
                <Text className="ml-2 text-sm text-indigo-700 dark:text-indigo-300">Currently Reading</Text>
              </View>
            )}

            {entry?.read && !entry?.currentlyReading && (
              <View className="mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex-row items-center">
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text className="ml-2 text-sm text-green-700 dark:text-green-300">Completed</Text>
              </View>
            )}

            <View className="flex-row mt-4 space-x-3">
              {entry?.currentlyReading ? (
                <BookActionButton
                  icon="x-circle"
                  label="Stop Reading"
                  onPress={() => updateReadingStatus(false)}
                  loading={actionLoading}
                />
              ) : (
                <BookActionButton
                  icon="book-open"
                  label="Start Reading"
                  onPress={() => updateReadingStatus(true)}
                  primary
                  loading={actionLoading}
                />
              )}
            </View>

            {/* Page Tracking Section */}
            <View className="mt-5 bg-gray-50 dark:bg-gray-800/80 p-4 rounded-lg">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Track Your Progress</Text>
              <View className="flex-row items-center space-x-3">
                <TextInput
                  value={currentPage}
                  onChangeText={(text) => {
                    // Only allow numbers
                    if (/^\d*$/.test(text)) {
                      const value = Number.parseInt(text)
                      if (!isNaN(value) && book.pages && value > book.pages) {
                        setCurrentPage(book.pages.toString())
                      } else {
                        setCurrentPage(text)
                      }
                    }
                  }}
                  keyboardType="numeric"
                  className="flex-1 bg-white dark:bg-gray-700 px-3 py-2.5 rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                  placeholder="Page #"
                  placeholderTextColor="#9ca3af"
                />
                <Pressable
                  onPress={updatePageNumber}
                  disabled={actionLoading}
                  className={`px-4 py-2.5 ${actionLoading ? "bg-indigo-400" : "bg-indigo-600"} rounded-lg`}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium">Update</Text>
                  )}
                </Pressable>
              </View>

              {book.pages && (
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This book has {book.pages} pages in total
                </Text>
              )}
            </View>

            {!entry?.read ? (
              <View className="mt-4">
                <BookActionButton
                  icon="check-circle"
                  label="Mark as Read"
                  primary
                  loading={actionLoading}
                  onPress={() => updateReadStatus(true)}
                />
              </View>
            ) : (
              <View className="mt-4">
                <BookActionButton
                  icon="refresh-cw"
                  label="Mark as Unread"
                  loading={actionLoading}
                  onPress={() => updateReadStatus(false)}
                />
              </View>
            )}

            {/* Synopsis Section */}
            <View className="mt-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Synopsis</Text>
              <View className={`overflow-hidden ${!expandedSynopsis ? "max-h-32" : ""}`}>
                <RenderHTML
                  contentWidth={width}
                  source={{ html: `<div>${book.synopsis}</div>` }}
                  baseStyle={{
                    color: "#4b5563",
                    fontSize: 15,
                    lineHeight: 24,
                  }}
                />
              </View>

              {book.synopsis && book.synopsis.length > 150 && (
                <TouchableOpacity
                  onPress={() => setExpandedSynopsis(!expandedSynopsis)}
                  className="mt-2 flex-row items-center"
                >
                  <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {expandedSynopsis ? "Show less" : "Read more"}
                  </Text>
                  <Feather
                    name={expandedSynopsis ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#6366f1"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Book Details Section */}
            <View className="mt-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Details</Text>
              <View className="bg-gray-50 dark:bg-gray-800/80 rounded-lg p-3">
                <InfoItem label="ISBN" value={book.isbn13 || "Not available"} />
                <InfoItem label="Published" value={book.date_published || "Not available"} />
                <InfoItem label="Pages" value={book.pages || "Not available"} />
                <InfoItem label="Language" value="English" />
                <InfoItem label="Publisher" value={book.publisher || "Not available"} />
              </View>
            </View>

            {/* Back Button */}
            <View className="mt-6">
              <Pressable
                onPress={() => router.push("/books")}
                className="py-3.5 rounded-lg flex-row items-center justify-center border border-gray-200 dark:border-gray-700"
              >
                <Feather name="arrow-left" size={18} color="#6366f1" />
                <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">Back to Books</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
