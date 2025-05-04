"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, Pressable, Alert, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAppStore } from "../../../store/store";
import { getBookClubDetails, searchUserByEmail, sendBookClubInvite } from "../../../lib/api";

interface Member {
  id: number;
  username: string;
  email: string;
}

interface BookClub {
  id: number;
  name: string;
  members: Member[];
}

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const token = useAppStore((state) => state.token);
  const [club, setClub] = useState<BookClub | null>(null);
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<Member | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await getBookClubDetails(token!, Number(id));
        setClub(data);
      } catch (err) {
        Alert.alert("Error", (err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadDetails();
  }, [id]);

  const handleSearchUser = async () => {
    if (!inviteEmail.trim()) return;
    try {
      setSearching(true);
      const user = await searchUserByEmail(token!, inviteEmail);
      setFoundUser(user);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
      setFoundUser(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSendInvite = async () => {
    if (!foundUser) return;
    try {
      await sendBookClubInvite(token!, Number(id), foundUser.id);
      Alert.alert("Success", `${foundUser.username} has been invited`);
      setInviteEmail("");
      setFoundUser(null);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 px-4">
      <View className="flex-row items-center justify-between py-4">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#6366f1" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">{club?.name || "Book Club"}</Text>
        <View className="w-9" />
      </View>

      <View className="mt-6">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Invite Member</Text>

        <View className="flex-row items-center border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
          <TextInput
            placeholder="Enter email"
            className="flex-1 text-gray-900 dark:text-white"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity onPress={handleSearchUser} disabled={searching}>
            {searching ? <ActivityIndicator size="small" color="#6366f1" /> : <Feather name="search" size={20} color="#6366f1" />}
          </TouchableOpacity>
        </View>

        {foundUser && (
          <View className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Text className="text-base font-medium text-gray-900 dark:text-white">{foundUser.username}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">{foundUser.email}</Text>
            <TouchableOpacity onPress={handleSendInvite} className="mt-3 px-4 py-2 bg-indigo-600 rounded-lg self-start">
              <Text className="text-white font-medium">Send Invite</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Members</Text>
          <FlatList
            data={club?.members}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="mb-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Text className="text-base font-medium text-gray-900 dark:text-white">{item.username}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{item.email}</Text>
              </View>
            )}
          />
        </View>
      )}

    </SafeAreaView>
  );
}
