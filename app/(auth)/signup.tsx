import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../../lib/apiClient';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      await registerUser(email, password);
      Alert.alert('Success', 'Account created. Please log in.');
      router.replace('/login');
    } catch (err) {
      Alert.alert('Signup Error', (err as Error).message);
    }
  };

  return (
    <View className="p-4">
      <Text className="text-xl mb-2">Signup</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="border p-2 mb-2" />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} className="border p-2 mb-4" />
      <Button title="Create Account" onPress={handleSignup} />
      <Text onPress={() => router.push('/login')} className="mt-4 text-blue-500">Back to Login</Text>
    </View>
  );
}