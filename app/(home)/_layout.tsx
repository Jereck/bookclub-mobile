import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useRef } from 'react';

const COLORS = {
  paper: '#f8f5e6',
  leather: '#8b4513',
  gold: '#d4af37',
  ink: '#1a1a1a',
  bookmark: '#b22222',
  pageEdge: '#e8e6d9',
};

const TabButton = ({ isFocused, onPress, label, iconName, isAddButton = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  if (isAddButton) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.addButtonContainer}
      >
        <Animated.View
          style={[styles.addButton, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.bookmarkTail} />
          <View style={styles.bookmarkHead}>
            <Ionicons name="add" size={28} color="white" />
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabContent,
          isFocused ? styles.activeTab : styles.inactiveTab,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={isFocused ? iconName : `${iconName}-outline`}
          size={22}
          color={isFocused ? COLORS.gold : COLORS.ink}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? COLORS.gold : COLORS.ink },
          ]}
        >
          {label}
        </Text>
        {isFocused && (
          <>
            <View style={styles.spineDecoration} />
            <View style={[styles.spineDecoration, { bottom: '30%' }]} />
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
      tabBar={({ state, descriptors, navigation }) => {
        const routes = state.routes.filter((r) => r.name !== 'add');
        const midpoint = Math.floor(routes.length / 2);
        const leftTabs = routes.slice(0, midpoint);
        const rightTabs = routes.slice(midpoint);

        return (
          <View
            style={[
              styles.customTabBar,
              { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
            ]}
          >
            <View style={styles.bookshelfShadow} />
            <View style={styles.tabsContainer}>
              {leftTabs.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.title || route.name;
                const isFocused = state.index === state.routes.findIndex(r => r.name === route.name);
                const iconName = route.name === 'index' ? 'home'
                  : route.name === 'club' ? 'people'
                  : route.name === 'books' ? 'book'
                  : 'person';

                return (
                  <TabButton
                    key={route.key}
                    isFocused={isFocused}
                    onPress={() => navigation.navigate(route.name)}
                    label={label}
                    iconName={iconName}
                  />
                );
              })}

              <View style={{ width: 64 }} />

              {rightTabs.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.title || route.name;
                const isFocused = state.index === state.routes.findIndex(r => r.name === route.name);
                const iconName = route.name === 'index' ? 'home'
                  : route.name === 'club' ? 'people'
                  : route.name === 'books' ? 'book'
                  : 'person';

                return (
                  <TabButton
                    key={route.key}
                    isFocused={isFocused}
                    onPress={() => navigation.navigate(route.name)}
                    label={label}
                    iconName={iconName}
                  />
                );
              })}
            </View>
            <TabButton
              isFocused={state.index === state.routes.findIndex(r => r.name === 'add')}
              onPress={() => navigation.navigate('add')}
              iconName="add"
              isAddButton
            />
          </View>
        );
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="club" options={{ title: 'Club' }} />
      <Tabs.Screen name="add" options={{ title: '' }} />
      <Tabs.Screen name="books" options={{ title: 'Books' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bookshelfShadow: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: -1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    height: 75,
    backgroundColor: COLORS.leather,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    width: '80%',
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: COLORS.paper,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.pageEdge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  inactiveTab: {
    backgroundColor: COLORS.paper,
    opacity: 0.7,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  spineDecoration: {
    position: 'absolute',
    right: 0,
    top: '20%',
    width: 3,
    height: 20,
    backgroundColor: COLORS.gold,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
    zIndex: 10,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkHead: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.bookmark,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
    zIndex: 11,
  },
  bookmarkTail: {
    position: 'absolute',
    bottom: -12,
    width: 20,
    height: 30,
    backgroundColor: COLORS.bookmark,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    transform: [{ translateY: -5 }],
    zIndex: 10,
  },
});
