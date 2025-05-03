import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, Button, FlatList, Image, Alert, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useLibraryStore } from '../../store/libraryStore';
import { addBookToLibrary } from '../../lib/apiClient'; 
import { searchBooksByTitle } from '../../lib/apiClient'; 
import Toast from 'react-native-toast-message';

export default function AddBookPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const setNeedsRefresh = useLibraryStore((state) => state.setNeedsRefresh);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const books = await searchBooksByTitle(query);
      setResults(books);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book: any) => {
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
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-2">Search Books</Text>
      <TextInput
        className="border p-2 mb-2"
        placeholder="Enter title or ISBN"
        value={query}
        onChangeText={setQuery}
      />
      <Button title={loading ? 'Searching...' : 'Search'} onPress={handleSearch} disabled={loading} />

      <FlatList
        data={results}
        keyExtractor={(item) => item.isbn13}
        className="mt-4"
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-4 border p-2 rounded">
            <Image source={{ uri: item.image }} style={{ width: 50, height: 75, marginRight: 10 }} />
            <View className="flex-1">
              <Text className="font-semibold">{item.title}</Text>
              <Text className="text-sm text-gray-500">{item.authors?.join(', ')}</Text>
            </View>
            <TouchableOpacity onPress={() => handleAddBook(item)} className="bg-blue-700 px-3 py-2 rounded">
              <Text className="text-white text-sm">Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
