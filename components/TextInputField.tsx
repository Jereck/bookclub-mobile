import { View, Text, TextInput } from "react-native"
import { Feather } from "@expo/vector-icons"

type Props = {
  label: string
  value: string
  onChange: (text: string) => void
  placeholder: string
  icon: keyof typeof Feather.glyphMap
  secure?: boolean
  showToggle?: boolean
  onToggleSecure?: () => void
}

export default function TextInputField({ label, value, onChange, placeholder, icon, secure, showToggle, onToggleSecure }: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>{label}</Text>
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
        <Feather name={icon} size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secure}
          style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: "#111827" }}
        />
        {showToggle && onToggleSecure && (
          <Feather name={secure ? "eye-off" : "eye"} size={18} color="#9CA3AF" onPress={onToggleSecure} />
        )}
      </View>
    </View>
  )
}
