import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  isLoading: boolean;
  user: any;
  setUser: (user: any) => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  onboardingComplete: false,
  setOnboardingComplete: () => {},
  isLoading: true,
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await AsyncStorage.getItem('token');
        if (!stored) {
          setIsLoading(false);
          return;
        }
        setTokenState(stored);
        api.defaults.headers.common.Authorization = `Bearer ${stored}`;
        const res = await api.get('/auth/me');
        setOnboardingComplete(res.data.onboarding_complete ?? false);
        setUser(res.data);
      } catch {
        await AsyncStorage.removeItem('token');
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const setToken = async (t: string | null) => {
    setTokenState(t);
    if (t) {
      await AsyncStorage.setItem('token', t);
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    } else {
      await AsyncStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        onboardingComplete,
        setOnboardingComplete,
        isLoading,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
