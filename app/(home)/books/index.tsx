"use client";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAppStore } from "@/store/store";
import { getUserBookshelf } from "@/lib/api/bookshelfApi";

const { width } = Dimensions.get("window");

interface Book {
  id: number;
  title: string;
  authors: string[];
  image: string;
  genre?: string;
}

const BookGridItem = ({ book, onPress }: { book: Book; onPress: () => void }) => {
  const authorText = book.authors.join(", ");

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-6 mx-1"
      style={{ width: (width - 48) / 2 }}
    >
      <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
        <View className="aspect-[2/3] bg-gray-200 dark:bg-gray-700">
          <Image source={{ uri: book.image }} className="w-full h-full" resizeMode="cover" />
        </View>
        <View className="p-3">
          <Text className="text-sm font-medium text-gray-900 dark:text-white" numberOfLines={1}>
            {book.title}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1" numberOfLines={1}>
            {authorText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BookListItem = ({ book, onPress }: { book: Book; onPress: () => void }) => {
  const authorText = book.authors.join(", ");

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 mx-1 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
    >
      <View className="flex-row p-3">
        <View className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
          <Image source={{ uri: book.image }} className="w-full h-full" resizeMode="cover" />
        </View>
        <View className="flex-1 ml-3 justify-center">
          <Text className="text-base font-medium text-gray-900 dark:text-white" numberOfLines={2}>
            {book.title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={1}>
            {authorText}
          </Text>
          {book.genre && (
            <View className="mt-2 bg-indigo-50 dark:bg-indigo-900/30 self-start px-2 py-0.5 rounded-full">
              <Text className="text-xs text-indigo-600 dark:text-indigo-400">{book.genre}</Text>
            </View>
          )}
        </View>
        <View className="justify-center">
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BooksTab() {
  const router = useRouter();
  const token = useAppStore((state) => state.token);
  const needsRefresh = useAppStore((state) => state.needsRefresh);
  const setNeedsRefresh = useAppStore((state) => state.setNeedsRefresh);

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const bookshelf = await getUserBookshelf(token!);

      const enhancedLibrary = bookshelf.map((entry: any) => {
        const genres = ["Fiction", "Sci-Fi", "Fantasy", "Mystery", "History"];
        return {
          id: entry.book.id,
          title: entry.book.title,
          authors: entry.book.authors,
          image: entry.book.image,
          genre: genres[Math.floor(Math.random() * genres.length)],
        };
      });

      setBooks(enhancedLibrary);
      setFilteredBooks(enhancedLibrary);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    if (needsRefresh) {
      loadLibrary();
      setNeedsRefresh(false);
    }
  }, [needsRefresh]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter((book) =>
        book.title.toLowerCase().includes(query) ||
        book.authors.some((author) => author.toLowerCase().includes(query))
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">Loading your bookshelf...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">My Bookshelf</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setViewMode("grid")}
                className={`w-9 h-9 rounded-l-lg items-center justify-center ${
                  viewMode === "grid" ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <Feather name="grid" size={18} color={viewMode === "grid" ? "white" : "#6b7280"} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                className={`w-9 h-9 rounded-r-lg items-center justify-center ${
                  viewMode === "list" ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <Feather name="list" size={18} color={viewMode === "list" ? "white" : "#6b7280"} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-2 mb-4">
            <Feather name="search" size={18} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-gray-900 dark:text-white"
              placeholder="Search books or authors"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}> <Feather name="x" size={18} color="#9ca3af" /> </TouchableOpacity>
            )}
          </View>
        </View>

        {books.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <Feather name="book" size={48} color="#9ca3af" />
            <Text className="text-xl font-medium text-gray-500 dark:text-gray-400 mt-4 text-center">
              Your bookshelf is empty
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Start adding books to your collection
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(home)/add")}
              className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg"
            >
              <Text className="text-white font-medium">Discover Books</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBooks.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <Feather name="search" size={48} color="#9ca3af" />
            <Text className="text-xl font-medium text-gray-500 dark:text-gray-400 mt-4 text-center">
              No results found
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Try a different search term
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery("")} className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg">
              <Text className="text-white font-medium">Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            numColumns={viewMode === "grid" ? 2 : 1}
            key={viewMode}
            renderItem={({ item }) =>
              viewMode === "grid" ? (
                <BookGridItem book={item} onPress={() => router.push(`/books/${item.id}`)} />
              ) : (
                <BookListItem book={item} onPress={() => router.push(`/books/${item.id}`)} />
              )
            }
            ListFooterComponent={<View className="h-20" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
