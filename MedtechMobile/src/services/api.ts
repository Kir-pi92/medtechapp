import axios from 'axios';

// API base URL - change this to your server address
// For local development: http://localhost:3001/api
// For production: https://your-server.com/api
const API_BASE_URL = 'http://192.168.1.104:3001/api'; // Updated with local IP

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Report types
export interface ServiceReport {
    id?: string;
    reportNumber?: string;
    serviceDate: string;
    deviceType: string;
    brand: string;
    model: string;
    serialNumber: string;
    tagNumber?: string;
    productionYear?: string;
    customerName: string;
    department?: string;
    contactPerson?: string;
    customerEmail?: string;
    faultDescription: string;
    actionTaken: string;
    partsUsed?: { name: string; code?: string; quantity: number }[];
    status: 'pending' | 'completed' | 'parts_needed' | 'scrapped';
    technicianName: string;
    notes?: string;
    technicianSignature?: string;
    customerSignature?: string;
    photos?: string[];
    createdAt?: string;
    updatedAt?: string;
}

// API functions
export const reportService = {
    getAll: () => api.get<ServiceReport[]>('/reports'),
    getById: (id: string) => api.get<ServiceReport>(`/reports/${id}`),
    create: (data: ServiceReport) => api.post<ServiceReport>('/reports', data),
    update: (id: string, data: ServiceReport) => api.put<ServiceReport>(`/reports/${id}`, data),
    delete: (id: string) => api.delete(`/reports/${id}`),
};

export const deviceService = {
    getByKno: (kno: string) => api.get(`/device/${kno}`),
};
