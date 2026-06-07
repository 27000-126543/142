import { create } from 'zustand';
import type { User, UserRole, Message } from '/shared/types';
import { api } from '../services/api';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  unreadMessages: Message[];
  unreadCount: number;
  
  login: (role: UserRole, username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
  fetchUnreadMessages: () => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  unreadMessages: [],
  unreadCount: 0,

  login: async (role, username, password) => {
    set({ isLoading: true });
    try {
      const response = await api.login({ role, username, password });
      api.setCurrentUser(response.user, response.token);
      set({ 
        user: response.user, 
        isAuthenticated: true,
        isLoading: false 
      });
      get().fetchUnreadMessages();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    set({ 
      user: null, 
      isAuthenticated: false,
      unreadMessages: [],
      unreadCount: 0
    });
  },

  loadUser: () => {
    const user = api.getCurrentUser();
    if (user) {
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
      get().fetchUnreadMessages();
    } else {
      set({ isLoading: false });
    }
  },

  fetchUnreadMessages: async () => {
    try {
      const response = await api.getMessages(false);
      set({
        unreadMessages: response.messages,
        unreadCount: response.unreadCount,
      });
    } catch (error) {
      console.error('Failed to fetch unread messages:', error);
    }
  },

  markMessageRead: async (id: string) => {
    try {
      await api.markMessageRead(id);
      set(state => ({
        unreadMessages: state.unreadMessages.filter(m => m.id !== id),
        unreadCount: state.unreadCount - 1,
      }));
    } catch (error) {
      console.error('Failed to mark message read:', error);
    }
  },
}));
