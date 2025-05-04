import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../../store/store';
import { addBookToLibrary, searchBooksByTitle } from '../../lib/api';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Book {
  title: string;
  isbn13: string;
  authors: string[];
  pages?: number;
  image: string;
  excerpt?: string;
  synopsis?: string;
}

export default function AddBookPage() {
  const token = useAppStore((state) => state.token);
  const router = useRouter();
  const setNeedsRefresh = useAppStore((state) => state.setNeedsRefresh);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const books = await searchBooksByTitle(query);
      setResults(books);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Search failed',
        text2: 'Could not fetch books. Please check your connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book: Book) => {
    try {
      await addBookToLibrary(
        {
          title: book.title,
          isbn13: book.isbn13,
          authors: book.authors,
          pages: book.pages || 0,
          image: book.image,
          overview: book.excerpt || '',
          synopsis: book.synopsis || '',
          date_published: new Date().toISOString().split('T')[0],
        },
        token!
      );
      Toast.show({
        type: 'success',
        text1: 'Book added!',
        text2: `${book.title} has been added to your library.`,
      });
      setNeedsRefresh(true);
      router.replace('/(home)/books');
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Add failed',
        text2: 'Unable to add book. Try again.',
      });
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
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-medium">Search</Text>
          )}
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
            <TouchableOpacity onPress={() => handleAddBook(item)} className="bg-indigo-600 px-3 py-2 rounded">
              <Text className="text-white text-sm">Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
