import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { getBookFromLibrary } from '../../lib/apiClient';

export default function BookDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const result = await getBookFromLibrary(Number(id), token!);
        setBook(result.book);
      } catch (err) {
        Alert.alert('Error', (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadBook();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!book) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Book not found.</Text>
      </View>
    );
  }

  return (
    <View>
      <Stack.Screen
        options={{
          headerTitle: book.title,
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="p-4">
        <Image source={{ uri: book.image }} style={{ width: '100%', height: 300, borderRadius: 8 }} />
        <Text className="text-2xl font-bold mt-4">{book.title}</Text>
        <Text className="text-md text-gray-600 mt-1">{book.authors?.join(', ')}</Text>
        <Text className="text-sm text-gray-400 mt-1">ISBN13: {book.isbn13}</Text>
        <Text className="text-sm mt-4">{book.synopsis}</Text>
        <Text className="text-xs text-gray-400 mt-4">Published: {book.datePublished}</Text>
        <Text className="text-xs text-gray-400">Pages: {book.pages}</Text>
      </ScrollView>
    </View>
  );
}
