// Use relative URL - Vite proxy handles /api in dev, production serves from same origin
const API_URL = '';

// Get stored token
const getToken = (): string | null => {
    return localStorage.getItem('medtech_token');
};

// Set token
export const setToken = (token: string): void => {
    localStorage.setItem('medtech_token', token);
};

// Clear token
export const clearToken = (): void => {
    localStorage.removeItem('medtech_token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
};

// ============== AUTH ==============

export interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const authApi = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        return apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    register: async (username: string, password: string, fullName: string): Promise<AuthResponse> => {
        return apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, fullName }),
        });
    },

    getMe: async (): Promise<User> => {
        return apiRequest('/api/auth/me');
    },
};

// ============== REPORTS ==============

import type { ServiceReport } from './types';

export const reportsApi = {
    getAll: async (): Promise<ServiceReport[]> => {
        return apiRequest('/api/reports');
    },

    getById: async (id: string): Promise<ServiceReport> => {
        return apiRequest(`/api/reports/${id}`);
    },

    create: async (report: Omit<ServiceReport, 'id'>): Promise<ServiceReport> => {
        return apiRequest('/api/reports', {
            method: 'POST',
            body: JSON.stringify(report),
        });
    },

    update: async (id: string, report: Partial<ServiceReport>): Promise<ServiceReport> => {
        return apiRequest(`/api/reports/${id}`, {
            method: 'PUT',
            body: JSON.stringify(report),
        });
    },

    delete: async (id: string): Promise<void> => {
        return apiRequest(`/api/reports/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============== SETTINGS ==============

export interface Settings {
    companyName?: string;
    companyLogo?: string;
    templateConfig?: object;
}

export const settingsApi = {
    get: async (): Promise<Settings> => {
        return apiRequest('/api/settings');
    },

    save: async (settings: Settings): Promise<void> => {
        return apiRequest('/api/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    },
};

// ============== QR DEVICE ==============

export const deviceApi = {
    getByKno: async (kno: string) => {
        return apiRequest(`/api/device/${kno}`);
    },
};
