// BookDetail.tsx (Updated)
"use client"

import RenderHTML from 'react-native-render-html';
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useWindowDimensions } from 'react-native';
import { Feather } from "@expo/vector-icons"
import { useAppStore } from '../../../store/store';
import { getBookshelfEntry, markAsCurrentlyReading, unmarkCurrentlyReading, updateBookshelfEntry } from '../../../lib/api';
import { Book, BookshelfEntry } from '../../../lib/api/types';

// Star Rating Component
const StarRating = ({ rating = 0 }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  return (
    <View className="flex-row">
      {[...Array(fullStars)].map((_, i) => (
        <Feather key={`full-${i}`} name="star" size={16} color="#F59E0B" />
      ))}
      {halfStar && <Feather name="star" size={16} color="#F59E0B" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Feather key={`empty-${i}`} name="star" size={16} color="#D1D5DB" />
      ))}
    </View>
  )
}

// Book Action Button Component
const BookActionButton = ({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: string
  label: string
  onPress: () => void
  primary?: boolean
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${primary ? "bg-indigo-600" : "bg-gray-100 dark:bg-gray-800"
      }`}
  >
    <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color={primary ? "white" : "#6366f1"} />
    <Text className={`ml-1.5 text-sm font-medium ${primary ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`}>
      {label}
    </Text>
  </Pressable>
)

// Info Item Component
const InfoItem = ({ label, value }: { label: string; value: string | number }) => (
  <View className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-800">
    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 w-24">{label}</Text>
    <Text className="text-sm text-gray-900 dark:text-white flex-1">{value}</Text>
  </View>
)

export default function BookDetail() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const token = useAppStore((state) => state.token)
  const [book, setBook] = useState<Book | null>(null)
  const [entry, setEntry] = useState<BookshelfEntry | null>(null)
  const [currentPage, setCurrentPage] = useState(entry?.currentPage.toString() || "0");
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBook = async () => {
      try {
        const entry = await getBookshelfEntry(token!, Number(id))
        if (!entry || !entry.book) throw new Error("Book not found")

        setEntry(entry)
        setCurrentPage(entry.currentPage.toString());
        setBook(entry.book)
      } catch (err) {
        Alert.alert("Error", (err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    if (id) loadBook()
  }, [id])

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
          className="mt-6 py-2 px-4 bg-indigo-600 rounded-lg flex-row items-center"
        >
          <Feather name="arrow-left" size={16} color="white" />
          <Text className="ml-2 text-white font-medium">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 mb-14">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Book Cover with Gradient Overlay */}
        <View className="w-full h-72 bg-gray-100 dark:bg-gray-800">
          <Image source={{ uri: book.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
        </View>

        {/* Book Info Card */}
        <View className="px-4 -mt-16">
          <View className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
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
                  {book.authors?.join(', ') || "Unknown Author"}
                </Text>

                <View className="flex-row items-center mb-2">
                  <StarRating rating={book.rating || 0} />
                  <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {book.rating?.toFixed(1) || "0.0"}
                  </Text>
                </View>
                {entry?.currentPage !== undefined && book.pages ? (
                  <View className="w-full mt-1">
                    <View className="flex-row justify-between mb-0.5">
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Page {entry.currentPage} of {book.pages}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor((entry.currentPage / book.pages) * 100)}%
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className={`h-full ${entry.currentPage >= book.pages ? "bg-green-500" : "bg-indigo-600"} rounded-full`}
                        style={{
                          width: `${Math.min(100, (entry.currentPage / book.pages) * 100)}%`,
                        }}
                      />
                    </View>
                  </View>
                ) : null}

                <View className="flex-row flex-wrap">
                  {book.genres?.map((genre, index) => (
                    <View key={index} className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full mr-2 mb-1">
                      <Text className="text-xs text-indigo-600 dark:text-indigo-400">{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View className="flex-row mt-4 space-x-2">
              {entry?.currentlyReading ? (
                <BookActionButton
                  icon="x-circle"
                  label="Stop Reading"
                  onPress={async () => {
                    try {
                      if (entry.book?.id) {
                        await unmarkCurrentlyReading(token!, entry.book.id)
                      } else {
                        throw new Error("Book ID is undefined")
                      }
                      setEntry({ ...entry, currentlyReading: false })
                      Alert.alert("Updated", "You’ve finished reading this book.")
                    } catch (err) {
                      Alert.alert("Error", (err as Error).message)
                    }
                  }}
                  primary={false}
                />
              ) : (
                <BookActionButton
                  icon="book-open"
                  label="Start Reading"
                  onPress={async () => {
                    try {
                      if (entry && entry.book?.id) {
                        await markAsCurrentlyReading(token!, entry.book.id)
                      } else {
                        throw new Error("Book entry or ID is undefined")
                      }
                      setEntry({ ...entry, currentlyReading: true })
                      Alert.alert("Updated", "You’ve started reading this book.")
                    } catch (err) {
                      Alert.alert("Error", (err as Error).message)
                    }
                  }}
                  primary
                />
              )}
            </View>

            {/* Page Tracking Section */}
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Page</Text>
              <View className="flex-row items-center space-x-2">
                <TextInput
                  value={currentPage}
                  onChangeText={(text) => {
                    const value = parseInt(text);
                    if (!isNaN(value) && book.pages && value > book.pages) {
                      setCurrentPage(book.pages.toString());
                    } else {
                      setCurrentPage(text);
                    }
                  }}
                  keyboardType="numeric"
                  className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Page #"
                  placeholderTextColor="#9ca3af"
                />
                <Pressable
                  onPress={async () => {
                    try {
                      const page = parseInt(currentPage);
                      if (isNaN(page) || page < 0) throw new Error("Invalid page number");
                      if (book.pages && page > book.pages) throw new Error("Page number exceeds total pages");
                      if (!entry || !entry.book?.id) throw new Error("Book entry or ID is undefined")
                      const updated = await updateBookshelfEntry(token!, entry!.book.id, { currentPage: page });
                      setEntry(updated);
                      Alert.alert("Updated", `You're now on page ${page}`);
                    } catch (err) {
                      Alert.alert("Error", (err as Error).message);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 rounded-lg"
                >
                  <Text className="text-white font-medium">Update</Text>
                </Pressable>
              </View>
            </View>

            {!entry?.read ? (
              <View className="mt-4">
                <BookActionButton
                  icon="check-circle"
                  label="Mark as Read"
                  primary
                  onPress={async () => {
                    try {
                      if (!entry || !entry.book?.id) throw new Error("Book entry or ID is undefined");

                      const updated = await updateBookshelfEntry(token!, entry.book.id, {
                        read: true,
                        currentPage: book.pages, // set to final page
                      });

                      setEntry(updated);
                      setCurrentPage(String(book.pages)); // sync local state
                      Alert.alert("Great job!", "You’ve finished reading this book.");
                    } catch (err) {
                      Alert.alert("Error", (err as Error).message);
                    }
                  }}
                />
              </View>
            ) : (
              <View className="mt-4">
                <BookActionButton
                  icon="check-circle"
                  label="Mark as Unread"
                  onPress={async () => {
                    try {
                      if (!entry || !entry.book?.id) throw new Error("Book entry or ID is undefined")
                      const updated = await updateBookshelfEntry(token!, entry!.book.id, {
                        read: false,
                        currentPage: 0, // reset to 0
                      });
                      setEntry(updated);
                      setCurrentPage("0"); // sync local state
                      Alert.alert("Awesome!", "You have marked this book as unread");
                    } catch (err) {
                      Alert.alert("Error", (err as Error).message);
                    }
                  }}
                />
              </View>
            )}


            {/* Synopsis Section */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Synopsis</Text>
              <RenderHTML
                contentWidth={width}
                source={{ html: `<div>${book.synopsis}</div>` }}
                baseStyle={{ color: '#1f2937', fontSize: 16 }}
              />
            </View>

            {/* Book Details Section */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Details</Text>
              <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <InfoItem label="ISBN" value={book.isbn13} />
                <InfoItem label="Published" value={book.datePublished!} />
                <InfoItem label="Pages" value={book.pages!} />
                <InfoItem label="Language" value="English" />
              </View>
            </View>

            {/* Back Button */}
            <View className="px-4 mb-6">
              <Pressable
                onPress={() => router.push("/books")}
                className="py-3 rounded-lg flex-row items-center justify-center border border-gray-200 dark:border-gray-700"
              >
                <Feather name="arrow-left" size={18} color="#6366f1" />
                <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">Back to Books</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
