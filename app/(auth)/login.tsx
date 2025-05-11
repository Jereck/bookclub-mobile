"use client"

import { useState } from "react"
import { View, TextInput, Text, Alert, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAppStore } from "@/store/store"
import { loginUser } from "@/lib/api"
import TextInputField from "@/components/TextInputField"
import AuthHeader from "@/components/AuthHeader"

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
          <AuthHeader title="Book Club" subtitle="Connect through reading" />

          {/* Form */}
          <View className="space-y-6">
            <TextInputField label="Email" value={email} onChange={setEmail} placeholder="your@email.com" icon="mail" />
              <TextInputField
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                icon="lock"
                secure={!showPassword}
                showToggle
                onToggleSecure={() => setShowPassword(!showPassword)}
              />

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
