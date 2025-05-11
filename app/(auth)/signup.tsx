"use client"

import { useState } from "react"
import {
  View,
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
import { useAppStore } from "@/store/store"
import AuthHeader from "@/components/AuthHeader"
import ProfileImagePicker from "@/components/ProfileImagePicker"
import TextInputField from "@/components/TextInputField"

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
          <AuthHeader title="Create Account" subtitle="Join BookClub and start your reading journey" />
          <ProfileImagePicker imageUri={imageUri} setImageUri={setImageUri} />

          {/* Form Fields */}
          <TextInputField label="Username" value={username} onChange={setUsername} placeholder="Your username" icon="user" />
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
          <TextInputField
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
            icon="lock"
            secure={!showPassword}
          />

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
