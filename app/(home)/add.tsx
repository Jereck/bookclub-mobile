import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../../store/store';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchBooksByTitle } from '../../lib/api/booksApi';
import { getBookByISBN } from '../../lib/api/booksApi';
// import { addBookToDatabase } from '../../lib/api/booksApi'; 
import { addToBookshelf } from '../../lib/api/bookshelfApi';
import { Book } from '../../lib/api/types';

export default function AddBookPage() {
  const token = useAppStore((state) => state.token)!;
  const router = useRouter();
  const setNeedsRefresh = useAppStore((state) => state.setNeedsRefresh);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

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
  };

  const handleAddBook = async (book: Book) => {
    setAddingId(book.isbn13);
    try {
      // Step 1: Check if book exists in your central DB
      let centralBook;
      try {
        centralBook = await getBookByISBN(book.isbn13, token);
      } catch {
        // Step 2: If not, add it to the central DB
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
      }

      // Step 3: Add the book to the user's bookshelf
      await addToBookshelf(token, centralBook.id);

      Toast.show({
        type: 'success',
        text1: 'Book added!',
        text2: `${book.title} was added to your shelf.`,
      });
      setNeedsRefresh(true);
      router.replace('/(home)/books');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Add failed',
        text2: 'Something went wrong.',
      });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-6 bg-white dark:bg-gray-900">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">Search Books</Text>
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
          className={`px-4 py-2 rounded-lg ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
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
              <Text className="text-sm text-gray-500 dark:text-gray-400">{item.authors?.join(', ')}</Text>
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
    </SafeAreaView>
  );
}
