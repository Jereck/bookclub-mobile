import { View, TouchableOpacity, Image, Text, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"

export default function ProfileImagePicker({ imageUri, setImageUri }: { imageUri: string | null, setImageUri: (uri: string) => void }) {
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

  return (
    <View style={{ alignItems: "center", marginBottom: 24 }}>
      <TouchableOpacity onPress={pickImage} style={{ marginBottom: 8 }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: 80, height: 80, borderRadius: 40 }} />
        ) : (
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }}>
            <Feather name="user" size={32} color="#9CA3AF" />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage}>
        <Text style={{ color: "#6366F1", fontWeight: "500" }}>{imageUri ? "Change Photo" : "Add Profile Photo"}</Text>
      </TouchableOpacity>
    </View>
  )
}
