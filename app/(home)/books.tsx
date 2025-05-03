import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, FlatList, Image, Alert, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useLibraryStore } from '../../store/libraryStore';
import { getUserLibrary } from '../../lib/apiClient';

export default function BooksTab() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const needsRefresh = useLibraryStore((state) => state.needsRefresh);
  const setNeedsRefresh = useLibraryStore((state) => state.setNeedsRefresh);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const library = await getUserLibrary(token!);
      setBooks(library);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-lg text-gray-500">Your library is empty. Try adding a book!</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="px-4 pt-4"
      data={books}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => router.push(`/books/${item.id}`)}>
          <View className="flex-row items-center mb-4 border p-2 rounded bg-white">
            <Image source={{ uri: item.image }} style={{ width: 50, height: 75, marginRight: 10 }} />
            <View className="flex-1">
              <Text className="font-semibold">{item.title}</Text>
              <Text className="text-sm text-gray-500">{item.authors?.join(', ')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
