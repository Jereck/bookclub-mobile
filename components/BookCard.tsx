"use client"

import { useState } from "react"
import { View, Text, Image, Pressable, ScrollView, useWindowDimensions } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Book } from "@/lib/api/types"

export interface BookCardProps {
  book: Book
  onAdd?: () => void
  isAdded?: boolean
  onClose?: () => void
}

export default function BookCard({ book, onAdd, isAdded, onClose }: BookCardProps) {
  console.log("BookCard", book)
  const { width } = useWindowDimensions()
  const [expanded, setExpanded] = useState(false)

  return (
    <View style={{ width: width - 40 }} className="flex-1 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      {/* Close button */}
      {onClose && (
        <Pressable
          onPress={onClose}
          className="absolute top-3 right-3 z-10 bg-black/20 rounded-full w-8 h-8 items-center justify-center"
          style={{ elevation: 5 }}
        >
          <Feather name="x" size={18} color="#ffffff" />
        </Pressable>
      )}

      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Book Cover */}
        <View className="w-full aspect-[3/2] bg-gray-100 dark:bg-gray-700">
          {book.image ? (
            <Image source={{ uri: book.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Feather name="book" size={48} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Book Details */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">{book.title}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {book.authors ? book.authors[0] : "Unknown Author"}
          </Text>

          {/* Book Metadata */}
          <View className="flex-row flex-wrap items-center mb-4">
            {book.pages && (
              <View className="flex-row items-center mr-4 mb-1">
                <Feather name="file-text" size={14} color="#9ca3af" />
                <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400">{book.pages} pages</Text>
              </View>
            )}
            {book.date_published && (
              <View className="flex-row items-center mb-1">
                <Feather name="calendar" size={14} color="#9ca3af" />
                <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400">{book.date_published}</Text>
              </View>
            )}
          </View>

          {/* Genre Tags */}
          {/* {genres.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {genres.map((genre, index) => (
                <View key={index} className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-xs text-indigo-600 dark:text-indigo-400">{genre}</Text>
                </View>
              ))}
            </View>
          )} */}

          {/* Synopsis */}
          {book.synopsis ? (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Synopsis</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300" numberOfLines={expanded ? undefined : 4}>
                {book.synopsis}
              </Text>

              {book.synopsis.length > 120 && (
                <Pressable onPress={() => setExpanded(!expanded)} className="mt-2">
                  <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {expanded ? "Show less" : "Read more"}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}

          {/* Add to Shelf Button */}
          {onAdd && (
            <View>
              <Pressable
                onPress={onAdd}
                className={`py-3 rounded-lg flex-row items-center justify-center ${
                  isAdded ? "bg-green-500" : "bg-indigo-600"
                }`}
                android_ripple={{ color: isAdded ? "#16a34a" : "#4f46e5" }}
              >
                <Feather name={isAdded ? "check" : "plus"} size={16} color="white" />
                <Text className="ml-2 text-sm font-medium text-white">
                  {isAdded ? "Added to Shelf" : "Add to Shelf"}
                </Text>
              </Pressable>

              {/* ISBN Display */}
              <Text className="mt-3 text-xs text-center text-gray-400 dark:text-gray-500">ISBN: {book.isbn13}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
