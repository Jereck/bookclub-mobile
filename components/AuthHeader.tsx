import { View, Text } from "react-native"
import { Feather } from "@expo/vector-icons"

export default function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ alignItems: "center", marginVertical: 30 }}>
      <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Feather name="book-open" size={30} color="#6366F1" />
      </View>
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 14, color: "#6B7280" }}>{subtitle}</Text>
    </View>
  )
}
