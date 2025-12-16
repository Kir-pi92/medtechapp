import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, setToken, clearToken, type User } from './api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, fullName: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            const token = localStorage.getItem('medtech_token');
            if (token) {
                try {
                    const userData = await authApi.getMe();
                    setUser(userData);
                } catch (error) {
                    clearToken();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        const response = await authApi.login(username, password);
        setToken(response.token);
        setUser(response.user);
    };

    const register = async (username: string, password: string, fullName: string) => {
        const response = await authApi.register(username, password, fullName);
        setToken(response.token);
        setUser(response.user);
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
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
