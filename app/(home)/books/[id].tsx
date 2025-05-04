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
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useWindowDimensions } from 'react-native';
import { Feather } from "@expo/vector-icons"
import { useAppStore } from '../../../store/store';
import { getBookFromLibrary } from "../../../lib/api"

// Get screen dimensions for responsive layout


// Types
interface Author {
  name: string
  id: number
}

interface Book {
  id: number
  title: string
  authors: Author[] | string[]
  isbn13: string
  synopsis: string
  datePublished: string
  pages: number
  image: string
  rating?: number
  genres?: string[]
}

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
    className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${
      primary ? "bg-indigo-600" : "bg-gray-100 dark:bg-gray-800"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBook = async () => {
      try {
        const result = await getBookFromLibrary(Number(id), token!)
        // Add sample rating if not provided by API
        if (!result.book.rating) {
          result.book.rating = 4.5
        }
        // Add sample genres if not provided by API
        if (!result.book.genres) {
          result.book.genres = ["Fiction", "Science Fiction", "Adventure"]
        }
        setBook(result.book)
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

  // Format authors array to string
  const authorText = Array.isArray(book.authors)
    ? book.authors.map((author) => (typeof author === "string" ? author : author.name)).join(", ")
    : "Unknown Author"

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2">{authorText}</Text>

                {/* Rating */}
                <View className="flex-row items-center mb-2">
                  <StarRating rating={book.rating || 0} />
                  <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {book.rating?.toFixed(1) || "0.0"}
                  </Text>
                </View>

                {/* Genres */}
                <View className="flex-row flex-wrap">
                  {book.genres?.map((genre, index) => (
                    <View key={index} className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full mr-2 mb-1">
                      <Text className="text-xs text-indigo-600 dark:text-indigo-400">{genre}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row mt-4 space-x-2">
              <BookActionButton
                icon="book-open"
                label="Read Now"
                onPress={() => Alert.alert("Read", "Reading functionality coming soon!")}
                primary
              />
              <BookActionButton
                icon="bookmark"
                label="Save"
                onPress={() => Alert.alert("Save", "Book saved to your library!")}
              />
            </View>
          </View>

          {/* Synopsis Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Synopsis</Text>
            <RenderHTML
              contentWidth={width}
              source={{ html: `<div>${book.synopsis}</div>` }}
              baseStyle={{ color: '#1f2937', fontSize: 16 }} // optional
            />
          </View>

          {/* Book Details Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Details</Text>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <InfoItem label="ISBN" value={book.isbn13} />
              <InfoItem label="Published" value={book.datePublished} />
              <InfoItem label="Pages" value={book.pages} />
              <InfoItem label="Language" value="English" />
            </View>
          </View>

          {/* Community Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Community Reviews</Text>
              <Pressable onPress={() => Alert.alert("Reviews", "Full reviews coming soon!")}>
                <Text className="text-sm text-indigo-600 dark:text-indigo-400">See All</Text>
              </Pressable>
            </View>

            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Image
                  source={{ uri: "https://randomuser.me/api/portraits/women/32.jpg" }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
                <View className="ml-2">
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</Text>
                  <View className="flex-row items-center">
                    <StarRating rating={5} />
                    <Text className="ml-2 text-xs text-gray-500 dark:text-gray-400">2 days ago</Text>
                  </View>
                </View>
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                This book completely captivated me from start to finish. The character development was outstanding and
                the plot kept me guessing throughout.
              </Text>
            </View>

            <Pressable
              onPress={() => Alert.alert("Add Review", "Review functionality coming soon!")}
              className="flex-row items-center justify-center py-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Feather name="edit-2" size={16} color="#6366f1" />
              <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">Write a Review</Text>
            </Pressable>
          </View>

          {/* Similar Books Section */}
          <View className="mb-12">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">You Might Also Like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-1">
              {[1, 2, 3].map((item) => (
                <Pressable key={item} className="mr-4 items-center" style={{ width: width * 0.25 }}>
                  <Image
                    source={{
                      uri:
                        item === 1
                          ? "https://m.media-amazon.com/images/I/81nzxODnaJL._AC_UF1000,1000_QL80_.jpg"
                          : item === 2
                            ? "https://m.media-amazon.com/images/I/91uwocAMtSL._AC_UF1000,1000_QL80_.jpg"
                            : "https://m.media-amazon.com/images/I/81XQ1+piiiL._AC_UF1000,1000_QL80_.jpg",
                    }}
                    style={{ width: width * 0.25, height: width * 0.4, borderRadius: 8 }}
                    className="mb-2"
                  />
                  <Text className="text-xs font-medium text-gray-900 dark:text-white text-center" numberOfLines={2}>
                    {item === 1 ? "Dune" : item === 2 ? "The Martian" : "Ready Player One"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
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
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-row justify-between">
        <Pressable
          onPress={() => Alert.alert("Club", "Book club functionality coming soon!")}
          className="flex-row items-center"
        >
          <Feather name="users" size={20} color="#6366f1" />
          <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">Join Discussion</Text>
        </Pressable>
        <Pressable
          onPress={() => Alert.alert("Reading List", "Added to your reading list!")}
          className="flex-row items-center bg-indigo-600 px-4 py-2 rounded-lg"
        >
          <Feather name="plus" size={18} color="white" />
          <Text className="ml-1 text-white font-medium">Add to List</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
