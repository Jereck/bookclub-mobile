"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Toast from "react-native-toast-message"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"

import { useAppStore } from "@/store/store"
import { addToBookshelf, getBookByISBN, searchBooksByTitle } from "@/lib/api"
import type { Book, BookshelfEntry } from "@/lib/api/types"

const MAX_SELECTION = 3
const { width } = Dimensions.get("window")

export default function OnboardingScreen() {
  const router = useRouter()
  const token = useAppStore((s) => s.token)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Book[]>([])
  const [selected, setSelected] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    // Animate in the content when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return

    try {
      Keyboard.dismiss()
      setLoading(true)
      const books = await searchBooksByTitle(query)

      if (books.length === 0) {
        Toast.show({
          type: "info",
          text1: "No books found",
          text2: "Try a different search term",
          position: "bottom",
        })
      }

      setResults(books)
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Search failed",
        text2: "Could not fetch books. Please try again.",
        position: "bottom",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (book: Book) => {
    if (selected.some((b) => b.isbn13 === book.isbn13)) {
      // Deselect the book
      setSelected((prev) => prev.filter((b) => b.isbn13 !== book.isbn13))
    } else if (selected.length < MAX_SELECTION) {
      // Select the book with animation
      setSelected((prev) => [...prev, book])

      // Show toast when max selection is reached
      if (selected.length === MAX_SELECTION - 1) {
        Toast.show({
          type: "success",
          text1: "Great choices!",
          text2: "You've selected 3 books. Ready to continue?",
          position: "bottom",
        })
      }
    } else {
      // Alert user when trying to select more than MAX_SELECTION
      Toast.show({
        type: "info",
        text1: `Maximum ${MAX_SELECTION} books`,
        text2: "Deselect a book to choose a different one",
        position: "bottom",
      })
    }
  }

  const saveBooks = async () => {
    if (selected.length !== MAX_SELECTION) return

    try {
      setSaving(true)

      for (const book of selected) {
        // Step 1: Check if the book exists in your DB
        let centralBook: BookshelfEntry
        try {
          centralBook = await getBookByISBN(book.isbn13, token!)
        } catch {
          // Step 2: If not, add it to your DB
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/books`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: book.title,
              isbn13: book.isbn13,
              authors: book.authors,
              pages: book.pages || 0,
              image: book.image,
              synopsis: book.synopsis || "",
              date_published: book.date_published || "",
              publisher: book.publisher || "",
              subjects: book.subjects || [],
            }),
          })

          if (!response.ok) throw new Error("Failed to add book to DB")

          centralBook = await response.json()
          centralBook.read = true
        }

        // Step 3: Add to user's shelf
        await addToBookshelf(token!, centralBook.id)
      }

      // Success animation before navigation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.replace("/(home)")
      })
    } catch (err) {
      Alert.alert("Error", "Failed to save books. Please try again.")
      setSaving(false)
    }
  }

  // Render book item with animation
  const renderBookItem = ({ item, index }: { item: Book; index: number }) => {
    const isSelected = selected.some((b) => b.isbn13 === item.isbn13)
    const itemFade = new Animated.Value(0)
    const itemSlide = new Animated.Value(20)

    // Animate each item when it appears
    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(itemSlide, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start()

    return (
      <Animated.View
        style={{
          opacity: itemFade,
          transform: [{ translateY: itemSlide }],
        }}
      >
        <TouchableOpacity
          onPress={() => toggleSelect(item)}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            padding: 12,
            borderRadius: 12,
            backgroundColor: isSelected ? "#EEF2FF" : "#FFFFFF",
            borderWidth: 1,
            borderColor: isSelected ? "#6366F1" : "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: isSelected ? 2 : 1,
          }}
        >
          {/* Book cover */}
          <Image
            source={{ uri: item.image || "https://via.placeholder.com/80" }}
            style={{
              width: 60,
              height: 90,
              borderRadius: 6,
              marginRight: 12,
            }}
            resizeMode="cover"
          />

          {/* Book details */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              {item.authors?.[0] || "Unknown Author"}
            </Text>

            {item.pages && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="book-open" size={12} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginLeft: 4,
                  }}
                >
                  {item.pages} pages
                </Text>
              </View>
            )}
          </View>

          {/* Selection indicator */}
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              borderWidth: 1,
              borderColor: isSelected ? "#6366F1" : "#D1D5DB",
              backgroundColor: isSelected ? "#6366F1" : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSelected && <Feather name="check" size={16} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  // Selected books preview
  const renderSelectedBooks = () => {
    if (selected.length === 0) return null

    return (
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#4B5563",
            marginBottom: 8,
          }}
        >
          Your selections ({selected.length}/{MAX_SELECTION})
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {Array(MAX_SELECTION)
            .fill(0)
            .map((_, index) => {
              const book = selected[index]
              return (
                <View
                  key={index}
                  style={{
                    width: 70,
                    height: 100,
                    marginHorizontal: 6,
                    borderRadius: 8,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: book ? "#6366F1" : "#E5E7EB",
                    backgroundColor: book ? "#FFFFFF" : "#F3F4F6",
                  }}
                >
                  {book ? (
                    <TouchableOpacity onPress={() => toggleSelect(book)} style={{ width: "100%", height: "100%" }}>
                      <Image
                        source={{ uri: book.image || "https://via.placeholder.com/80" }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: "#EF4444",
                          borderRadius: 12,
                          width: 24,
                          height: 24,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Feather name="x" size={14} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="plus" size={20} color="#9CA3AF" />
                    </View>
                  )}
                </View>
              )
            })}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={["#4F46E5", "#6366F1", "#818CF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 20,
            paddingBottom: 30,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#FFFFFF",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Welcome to BookClub
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Pick 3 of your favorite books to get started
            </Text>

            {/* Search bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === "ios" ? 12 : 4,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.3)",
              }}
            >
              <Feather name="search" size={20} color="#FFFFFF" />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: "#FFFFFF",
                  fontSize: 16,
                  paddingVertical: Platform.OS === "ios" ? 0 : 8,
                }}
                placeholder="Search for books..."
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")} style={{ padding: 4 }}>
                  <Feather name="x" size={18} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Main content */}
        <Animated.View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Selected books preview */}
          {renderSelectedBooks()}

          {/* Results list */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 16 }}>Searching for books...</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderBookItem}
              keyExtractor={(item) => item.isbn13}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Feather name="book" size={48} color="#D1D5DB" />
              <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 16, textAlign: "center" }}>
                {query.trim()
                  ? "No books found. Try a different search term."
                  : "Search for your favorite books to get started"}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Continue button */}
        <View
          style={{
            padding: 20,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity
            onPress={saveBooks}
            disabled={selected.length !== MAX_SELECTION || saving}
            style={{
              backgroundColor: selected.length === MAX_SELECTION ? "#6366F1" : "#D1D5DB",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {selected.length === MAX_SELECTION
                    ? "Continue"
                    : `Select ${MAX_SELECTION - selected.length} more book${
                        MAX_SELECTION - selected.length !== 1 ? "s" : ""
                      }`}
                </Text>
                {selected.length === MAX_SELECTION && (
                  <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
