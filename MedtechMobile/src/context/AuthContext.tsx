import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../services/api';

interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync('auth_token');
            if (storedToken) {
                setAuthToken(storedToken);
                const response = await api.get('/auth/me');
                setUser(response.data);
                setToken(storedToken);
            }
        } catch (error) {
            console.log('No valid stored auth');
            await SecureStore.deleteItemAsync('auth_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token: newToken, user: userData } = response.data;

            await SecureStore.setItemAsync('auth_token', newToken);
            setAuthToken(newToken);
            setToken(newToken);
            setUser(userData);

            return { success: true };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Giriş başarısız. Lütfen tekrar deneyin.'
            };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('auth_token');
        setAuthToken(null);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
