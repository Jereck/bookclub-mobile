import { View, Text, Button } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function HomeTab() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-4">
      <Text className="text-2xl font-bold mb-2">Welcome, {user?.username}!</Text>
      <Text className="text-sm text-gray-500 mb-6">You're on the Home tab.</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}