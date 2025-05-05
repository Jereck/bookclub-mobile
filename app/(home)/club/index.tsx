import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getBookClubs,
  createBookClub,
} from "../../../lib/api";
import { useAppStore } from "../../../store/store";
import { Feather } from "@expo/vector-icons";
import { BookClub } from "../../../lib/api/types";

export default function ClubTab() {
  const router = useRouter();
  const token = useAppStore((state) => state.token);

  const [clubs, setClubs] = useState([]);
  const [clubName, setClubName] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const data = await getBookClubs(token!);
      setClubs(data);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async () => {
    if (!clubName.trim()) return;
    try {
      setCreating(true);
      await createBookClub(token!, clubName.trim());
      setClubName("");
      await loadClubs();
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setCreating(false);
    }
  };


  useEffect(() => {
    loadClubs();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Book Clubs</Text>

      {/* Create New Club */}
      <View className="flex-row items-center mb-6">
        <TextInput
          value={clubName}
          onChangeText={setClubName}
          placeholder="New club name"
          placeholderTextColor="#9ca3af"
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
        />
        <Pressable
          onPress={handleCreateClub}
          disabled={creating}
          className={`ml-2 px-4 py-2 rounded-lg ${
            creating ? "bg-indigo-400" : "bg-indigo-600"
          }`}
        >
          <Text className="text-white font-medium">{creating ? "..." : "Add"}</Text>
        </Pressable>
      </View>

      {/* Clubs Section */}
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Your Clubs</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : clubs.length === 0 ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400">You haven't joined any clubs yet.</Text>
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={(item: BookClub) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/club/${item.id}`)}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex-row items-center justify-between"
            >
              <View>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">Club ID: {item.id}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
