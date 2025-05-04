import { Tabs } from "expo-router"
import { View, Text, Pressable } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import type React from "react"

// Define types for the tab routes and navigation
type TabRouteName = "index" | "club" | "add" | "books" | "profile"

interface TabButtonProps {
  isFocused: boolean
  onPress: () => void
  label?: string
  iconName: string
  isAddButton?: boolean
}

// Define the TabButton component
const TabButton: React.FC<TabButtonProps> = ({ isFocused, onPress, label, iconName, isAddButton = false }) => {
  // For the add button, we'll use a special design
  if (isAddButton) {
    return (
      <Pressable
        onPress={onPress}
        className={`items-center justify-center w-12 h-12 rounded-full bg-indigo-600 shadow-md absolute -top-6 self-center`}
      >
        <Feather name="plus" size={24} color="white" />
      </Pressable>
    )
  }

  // For regular tab buttons
  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-center py-2">
      <View className={`items-center justify-center`}>
        <Feather name={iconName as keyof typeof Feather.glyphMap} size={20} color={isFocused ? "#4f46e5" : "#6b7280"} />
        <Text className={`text-xs mt-1 ${isFocused ? "text-indigo-600 font-medium" : "text-gray-500"}`}>{label}</Text>
        {isFocused && <View className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-600" />}
      </View>
    </Pressable>
  )
}

// Map route names to icon names
const getIconName = (routeName: TabRouteName): keyof typeof Feather.glyphMap => {
  switch (routeName) {
    case "index":
      return "home"
    case "club":
      return "users"
    case "books":
      return "book"
    case "profile":
      return "user"
    default:
      return "circle"
  }
}

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
        },
      }}
      tabBar={({
        state,
        descriptors,
        navigation,
      }: BottomTabBarProps) => {
        // Filter out the add tab from regular tabs
        const routes = state.routes.filter((r) => r.name !== "add")

        // Get the midpoint to place the add button
        const midpoint = Math.floor(routes.length / 2)
        const leftTabs = routes.slice(0, midpoint)
        const rightTabs = routes.slice(midpoint)

        return (
          <View
            className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm`}
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }}
          >
            <View className="flex-row relative">
              {/* Left tabs */}
              {leftTabs.map((route) => {
                const { options } = descriptors[route.key]
                const label = options.title || route.name
                const isFocused = state.index === state.routes.findIndex((r) => r.name === route.name)
                const iconName = getIconName(route.name as TabRouteName)

                return (
                  <TabButton
                    key={route.key}
                    isFocused={isFocused}
                    onPress={() => navigation.navigate(route.name)}
                    label={label}
                    iconName={iconName}
                  />
                )
              })}

              {/* Space for add button */}
              <View className="w-12" />

              {/* Right tabs */}
              {rightTabs.map((route) => {
                const { options } = descriptors[route.key]
                const label = options.title || route.name
                const isFocused = state.index === state.routes.findIndex((r) => r.name === route.name)
                const iconName = getIconName(route.name as TabRouteName)

                return (
                  <TabButton
                    key={route.key}
                    isFocused={isFocused}
                    onPress={() => navigation.navigate(route.name)}
                    label={label}
                    iconName={iconName}
                  />
                )
              })}
            </View>

            {/* Add button */}
            <TabButton
              isFocused={state.index === state.routes.findIndex((r) => r.name === "add")}
              onPress={() => navigation.navigate("add")}
              isAddButton
              iconName="plus"
              label=""
            />
          </View>
        )
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="club" options={{ title: "Club" }} />
      <Tabs.Screen name="add" options={{ title: "" }} />
      <Tabs.Screen name="books" options={{ title: "Books" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  )
}
