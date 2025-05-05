import { useState } from "react";
import { useRouter } from 'expo-router';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { searchBooksByTitle, getBookByISBN } from "../lib/api/booksApi";
import { addToBookshelf } from "../lib/api/bookshelfApi";

interface Book {
  title: string;
  isbn13: string;
  authors: string[];
  pages?: number;
  image: string;
  excerpt?: string;
  synopsis?: string;
}

interface BookSearchAndAddProps {
  token: string;
  onAdd?: (bookId: number, book?: Book) => void; // for e.g. setting club current book
  redirectOnAdd?: string; // e.g. '/(home)/bookshelf'
}

export default function BookSearchAndAdd({ token, onAdd, redirectOnAdd }: BookSearchAndAddProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();


  const handleSearch = async () => {
    try {
      setLoading(true);
      const books = await searchBooksByTitle(query);
      setResults(books);
    } catch {
      Toast.show({
        type: "error",
        text1: "Search failed",
        text2: "Could not fetch books. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book: Book) => {
    setAddingId(book.isbn13);
    try {
      // Try to fetch the book from your database
      let centralBook;
      try {
        centralBook = await getBookByISBN(book.isbn13, token);
      } catch {
        // Book not found, create it
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
            overview: book.excerpt || "",
            synopsis: book.synopsis || "",
            datePublished: new Date().toISOString().split("T")[0],
          }),
        });
        if (!response.ok) throw new Error("Failed to add book to DB");
        centralBook = await response.json();
      }

      // Add to bookshelf (optional)
      await addToBookshelf(token, centralBook.id);

      // Callback for parent to optionally use
      if (onAdd) onAdd(centralBook.id, book);

      Toast.show({
        type: "success",
        text1: "Book added!",
        text2: `${book.title} was added successfully.`,
      });

      if (redirectOnAdd) {
        router.replace(redirectOnAdd);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Add failed",
        text2: "Something went wrong.",
      });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View className="mt-4">
      <View className="flex-row items-center mb-4">
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg mr-2"
          placeholder="Enter title or ISBN"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading}
          className={`px-4 py-2 rounded-lg ${loading ? "bg-indigo-400" : "bg-indigo-600"}`}
        >
          {loading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-medium">Search</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.isbn13}
        className="mt-2"
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
            <Image source={{ uri: item.image }} style={{ width: 50, height: 75, marginRight: 10 }} />
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 dark:text-white">{item.title}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">{item.authors?.join(", ")}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleAddBook(item)}
              disabled={addingId === item.isbn13}
              className="bg-indigo-600 px-3 py-2 rounded"
            >
              {addingId === item.isbn13 ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-sm">Add</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
