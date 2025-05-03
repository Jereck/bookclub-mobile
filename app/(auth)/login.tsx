import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { loginUser } from '../../lib/apiClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const {token, user} = await loginUser(email, password);
      login(token, user);
      router.replace('/');
    } catch (err) {
      Alert.alert('Login Error', (err as Error).message);
    }
  };

  return (
    <View className="p-4">
      <Text className="text-xl mb-2">Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="border p-2 mb-2" />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} className="border p-2 mb-4" />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => router.push('/signup')} className="mt-4 text-blue-500">Go to Signup</Text>
    </View>
  );
}