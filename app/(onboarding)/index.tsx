import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Toast from 'react-native-toast-message';

import { useAppStore } from "@/store/store"
import { addToBookshelf, getBookByISBN, searchBooksByTitle } from "@/lib/api"
import { Book, BookshelfEntry } from "@/lib/api/types"


const MAX_SELECTION = 3

export default function OnboardingScreen() {
  const router = useRouter()
  const token = useAppStore((s) => s.token)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Book[]>([])
  const [selected, setSelected] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    try {
      setLoading(true);
      const books = await searchBooksByTitle(query);
      setResults(books);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Search failed',
        text2: 'Could not fetch books. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (book: Book) => {
    if (selected.some((b) => b.isbn13 === book.isbn13)) {
      setSelected((prev) => prev.filter((b) => b.isbn13 !== book.isbn13))
    } else if (selected.length < MAX_SELECTION) {
      setSelected((prev) => [...prev, book])
    }
  }

  const saveBooks = async () => {
    try {
      for (const book of selected) {
        // Step 1: Check if the book exists in your DB
        let centralBook: BookshelfEntry;
        try {
          centralBook = await getBookByISBN(book.isbn13, token!)
        } catch {
          // Step 2: If not, add it to your DB
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/books`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: book.title,
              isbn13: book.isbn13,
              authors: book.authors,
              pages: book.pages || 0,
              image: book.image,
              synopsis: book.synopsis || '',
              date_published: book.date_published || '',
              publisher: book.publisher || '',
              subjects: book.subjects || [],
              
            }),
          });
          if (!response.ok) throw new Error("Failed to add book to DB");
          centralBook = await response.json();
          centralBook.read = true;
        }
  
        // Step 3: Add to user's shelf
        await addToBookshelf(token!, centralBook.id);
      }
      router.replace("/(home)");
    } catch (err) {
      Alert.alert("Error", "Failed to save books");
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-12">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        Pick 3 of your favorite books
      </Text>

      <View className="flex-row items-center mb-4">
        <TextInput
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
          placeholder="Search by title..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} className="ml-2 p-2">
          <Feather name="search" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {results.map((book) => {
          const isSelected = selected.some((b) => b.isbn13 === book.isbn13)
          return (
            <TouchableOpacity
              key={book.isbn13}
              onPress={() => toggleSelect(book)}
              className={`flex-row items-center mb-3 p-3 rounded-lg border ${
                isSelected ? "border-indigo-600 bg-indigo-50" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <Image
                source={{ uri: book.image || "https://via.placeholder.com/80" }}
                className="w-12 h-16 rounded mr-3"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {book.title}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {book.authors?.[0] || "Unknown"}
                </Text>
              </View>
              {isSelected && <Feather name="check" size={20} color="#6366f1" />}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <TouchableOpacity
        onPress={saveBooks}
        disabled={selected.length !== 3}
        className={`mt-4 py-3 rounded-lg items-center ${
          selected.length === 3 ? "bg-indigo-600" : "bg-gray-400"
        }`}
      >
        <Text className="text-white font-bold">
          {selected.length === 3 ? "Continue" : `Select ${3 - selected.length} more`}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
