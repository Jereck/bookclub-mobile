import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../../lib/api';
import { User } from '../../lib/api/types';

export interface AuthSlice {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  restoreAuth: () => Promise<void>;
  fetchUserProfile: () => Promise<void>
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    AsyncStorage.setItem('token', token);
    AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  restoreAuth: async () => {
    const token = await AsyncStorage.getItem('token');
    const userRaw = await AsyncStorage.getItem('user');
    if (token && userRaw) {
      const user = JSON.parse(userRaw);
      set({ user, token, isAuthenticated: true });
    }
  },
  fetchUserProfile: async () => {
    const token = get().token
    if (!token) return

    try {
      const user = await getUserProfile(token)
      set({ user })
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    }
  },
});