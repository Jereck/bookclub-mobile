"use client"

import { useState } from "react"
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { getPresignedProfileUploadUrl, registerUser } from "@/lib/api"
import { Feather } from "@expo/vector-icons"
import { useAppStore } from "@/store/store"

const apiURL = process.env.EXPO_PUBLIC_API_URL

export default function SignupScreen() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const login = useAppStore((state) => state.login)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos to set a profile picture.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri)
    }
  }

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

      // Register user
      const result = await registerUser(username, email, password)
      const { token, user } = result

      await login(token, user)

      // Upload image if selected
      if (imageUri) {
        const { uploadUrl, key } = await getPresignedProfileUploadUrl(token)
        const imageBlob = await fetch(imageUri).then((res) => res.blob())

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: imageBlob,
          headers: { "Content-Type": "image/jpeg" },
        })

        if (!uploadRes.ok) {
          throw new Error("Profile picture upload failed")
        }

        // Update user profile with S3 key
        await fetch(`${apiURL}/user/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profilePicture: key }),
        })
      }

      router.replace("/(onboarding)")
    } catch (err) {
      Alert.alert("Signup Error", (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginTop: 40, marginBottom: 30 }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                backgroundColor: "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Feather name="book-open" size={30} color="#6366F1" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 4 }}>Create Account</Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>Join BookClub and start your reading journey</Text>
          </View>

          {/* Profile Picture */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 8 }}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="user" size={32} color="#9CA3AF" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text style={{ color: "#6366F1", fontWeight: "500" }}>
                {imageUri ? "Change Photo" : "Add Profile Photo"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>Username</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                paddingHorizontal: 12,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Feather name="user" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Your username"
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: "#111827",
                }}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>Email</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                paddingHorizontal: 12,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Feather name="mail" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: "#111827",
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>Password</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                paddingHorizontal: 12,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Feather name="lock" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: "#111827",
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>Confirm Password</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                paddingHorizontal: 12,
                backgroundColor: "#F9FAFB",
              }}
            >
              <Feather name="lock" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: "#111827",
                }}
              />
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? "#818CF8" : "#6366F1",
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: "#6B7280" }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")} style={{ marginLeft: 4 }}>
              <Text style={{ color: "#6366F1", fontWeight: "500" }}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
