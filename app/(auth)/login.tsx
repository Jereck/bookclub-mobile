"use client"

import { useState } from "react"
import { View, TextInput, Text, Alert, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppStore } from "@/store/store"
import { loginUser } from "@/lib/api"
import { Feather } from "@expo/vector-icons"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const login = useAppStore((state) => state.login)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password")
      return
    }

    try {
      setIsLoading(true)
      const { token, user } = await loginUser(email, password)
      await login(token, user)
      router.replace("/")
    } catch (err) {
      Alert.alert("Login Error", (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center">
        <View className="px-8 py-12 w-full max-w-sm mx-auto">
          {/* Logo and App Name */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-2xl items-center justify-center mb-4">
              <Feather name="book-open" size={40} color="#6366f1" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">BookClub</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">Connect through reading</Text>
          </View>

          {/* Form */}
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</Text>
              <View className="relative">
                <View className="absolute left-3 top-2.5">
                  <Feather name="mail" size={18} color="#9ca3af" />
                </View>
                <TextInput
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-gray-900 dark:text-white w-full"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-2.5">
                  <Feather name="lock" size={18} color="#9ca3af" />
                </View>
                <TextInput
                  placeholder="••••••••"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-10 text-gray-900 dark:text-white w-full"
                  placeholderTextColor="#9ca3af"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9ca3af" />
                </Pressable>
              </View>
            </View>

            <View className="items-end">
              <Pressable onPress={() => Alert.alert("Reset Password", "Feature coming soon!")}>
                <Text className="text-sm text-indigo-600 dark:text-indigo-400">Forgot password?</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className={`py-3 rounded-lg items-center justify-center ${isLoading ? "bg-indigo-400" : "bg-indigo-600"}`}
            >
              {isLoading ? (
                <Text className="text-white font-medium">Logging in...</Text>
              ) : (
                <Text className="text-white font-medium">Log In</Text>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          {/* <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <Text className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </View> */}

          {/* Social Login Buttons */}
          {/* <View className="space-y-4">
            <Pressable
              onPress={() => Alert.alert("Social Login", "Feature coming soon!")}
              className="flex-row items-center justify-center py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <Feather name="github" size={18} color="#333" />
              <Text className="ml-2 text-gray-800 dark:text-white font-medium">Continue with GitHub</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert("Social Login", "Feature coming soon!")}
              className="flex-row items-center justify-center py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <Feather name="twitter" size={18} color="#1DA1F2" />
              <Text className="ml-2 text-gray-800 dark:text-white font-medium">Continue with Twitter</Text>
            </Pressable>
          </View> */}

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600 dark:text-gray-400">Don't have an account?</Text>
            <Pressable onPress={() => router.push("/signup")} className="ml-1">
              <Text className="text-indigo-600 dark:text-indigo-400 font-medium">Sign up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
