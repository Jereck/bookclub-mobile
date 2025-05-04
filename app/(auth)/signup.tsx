"use client"

import { useState } from "react"
import { View, TextInput, Text, Alert, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { registerUser } from "../../lib/api"
import { Feather } from "@expo/vector-icons"

export default function SignupScreen() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields")
      return false
    }

    if (username.length < 3) {
      Alert.alert("Invalid Username", "Username must be at least 3 characters")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address")
      return false
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters")
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match")
      return false
    }

    return true
  }

  const handleSignup = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      await registerUser(username, email, password)
      Alert.alert("Success", "Account created. Please log in.")
      router.replace("/login")
    } catch (err) {
      Alert.alert("Signup Error", (err as Error).message)
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
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Join BookClub</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create your account</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Username Field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</Text>
              <View className="relative">
                <View className="absolute left-3 top-2.5">
                  <Feather name="user" size={18} color="#9ca3af" />
                </View>
                <TextInput
                  placeholder="Your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-gray-900 dark:text-white w-full"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Email Field */}
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

            {/* Password Field */}
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

            {/* Confirm Password Field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-2.5">
                  <Feather name="lock" size={18} color="#9ca3af" />
                </View>
                <TextInput
                  placeholder="••••••••"
                  value={confirmPassword}
                  secureTextEntry={!showPassword}
                  onChangeText={setConfirmPassword}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-gray-900 dark:text-white w-full"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Terms and Conditions */}
            <View className="flex-row items-start mt-2">
              <View className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 mr-2 mt-0.5" />
              <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                I agree to the <Text className="text-indigo-600 dark:text-indigo-400">Terms of Service</Text> and{" "}
                <Text className="text-indigo-600 dark:text-indigo-400">Privacy Policy</Text>
              </Text>
            </View>

            {/* Signup Button */}
            <Pressable
              onPress={handleSignup}
              disabled={isLoading}
              className={`py-3 rounded-lg items-center justify-center mt-4 ${
                isLoading ? "bg-indigo-400" : "bg-indigo-600"
              }`}
            >
              {isLoading ? (
                <Text className="text-white font-medium">Creating Account...</Text>
              ) : (
                <Text className="text-white font-medium">Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          {/* <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <Text className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </View> */}

          {/* Social Signup Buttons */}
          {/* <View className="space-y-3">
            <Pressable
              onPress={() => Alert.alert("Social Signup", "Feature coming soon!")}
              className="flex-row items-center justify-center py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <Feather name="github" size={18} color="#333" />
              <Text className="ml-2 text-gray-800 dark:text-white font-medium">Sign up with GitHub</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert("Social Signup", "Feature coming soon!")}
              className="flex-row items-center justify-center py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <Feather name="twitter" size={18} color="#1DA1F2" />
              <Text className="ml-2 text-gray-800 dark:text-white font-medium">Sign up with Twitter</Text>
            </Pressable>
          </View> */}

          {/* Login Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600 dark:text-gray-400">Already have an account?</Text>
            <Pressable onPress={() => router.push("/login")} className="ml-1">
              <Text className="text-indigo-600 dark:text-indigo-400 font-medium">Log in</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
