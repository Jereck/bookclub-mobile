import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { searchUserByEmail, sendBookClubInvite } from "../lib/apiClient";

export default function ClubInviteScreen({ clubId }: { clubId: number }) {
  const token = useAuthStore((state) => state.token);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) return;
    try {
      setLoading(true);
      const result = await searchUserByEmail(token!, email.trim());
      setUser(result);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!user) return;
    try {
      await sendBookClubInvite(token!, clubId, user.id);
      Alert.alert("Success", `${user.username} has been invited!`);
      setEmail("");
      setUser(null);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    }
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Invite by Email</Text>
      <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg mb-4 px-3 py-2 bg-white dark:bg-gray-800">
        <Feather name="mail" size={20} color="#6366f1" />
        <TextInput
          placeholder="Enter email"
          className="ml-2 flex-1 text-gray-900 dark:text-white"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={handleSearch} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#6366f1" /> : <Feather name="search" size={20} color="#6366f1" />}
        </TouchableOpacity>
      </View>

      {user && (
        <View className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
          <Text className="text-base font-medium text-gray-900 dark:text-white">{user.username}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{user.email}</Text>
          <TouchableOpacity
            className="mt-3 px-4 py-2 bg-indigo-600 rounded-lg self-start"
            onPress={handleInvite}
          >
            <Text className="text-white font-medium">Send Invite</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
