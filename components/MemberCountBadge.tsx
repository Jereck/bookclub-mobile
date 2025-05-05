import { useEffect } from "react"
import { Animated, Text } from "react-native"

export const MemberCountBadge = ({ count }: { count: number }) => {
    const animation = new Animated.Value(0)
  
    useEffect(() => {
      Animated.spring(animation, {
        toValue: 1,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }).start()
    }, [])
  
    return (
      <Animated.View
        style={{
          transform: [{ scale: animation }],
        }}
        className="absolute -top-2 -right-2 bg-indigo-600 rounded-full w-6 h-6 items-center justify-center"
      >
        <Text className="text-xs font-bold text-white">{count}</Text>
      </Animated.View>
    )
}