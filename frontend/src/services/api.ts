import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  LoginRequest, 
  RegisterRequest, 
  DocumentResponse, 
  FolderResponse,
  Document,
  Folder,
  User,
  DocumentStats,
  CategoryStats
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest) => api.post('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data: Partial<User>) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/auth/change-password', data),
};

// Documents API
export const documentsApi = {
  upload: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    subject?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    accessLevel?: string;
  }) => api.get('/documents', { params }),
  getById: (id: string) => api.get(`/documents/${id}`),
  download: (id: string) => api.get(`/documents/${id}/download`, {
    responseType: 'blob',
  }),
  update: (id: string, data: Partial<Document>) => api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  bulkDownload: (documentIds: string[]) => api.post('/documents/bulk-download', {
    documentIds,
  }, {
    responseType: 'blob',
  }),
  getStats: () => api.get('/documents/stats/overview'),
};

// Folders API
export const foldersApi = {
  create: (data: Partial<Folder>) => api.post('/folders', data),
  getAll: (params?: {
    parentFolder?: string;
    category?: string;
    search?: string;
  }) => api.get('/folders', { params }),
  getById: (id: string) => api.get(`/folders/${id}`),
  update: (id: string, data: Partial<Folder>) => api.put(`/folders/${id}`, data),
  delete: (id: string) => api.delete(`/folders/${id}`),
  getTree: () => api.get('/folders/tree/structure'),
  move: (id: string, newParentFolder: string | null) => 
    api.put(`/folders/${id}/move`, { newParentFolder }),
};

// Users API
export const usersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
  }) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: Partial<User>) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getDocuments: (id: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => api.get(`/users/${id}/documents`, { params }),
  getFolders: (id: string) => api.get(`/users/${id}/folders`),
  getSystemStats: () => api.get('/users/stats/system'),
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeInfo = (filename: string, mimeType: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const fileTypes: Record<string, { icon: string; color: string; category: string }> = {
    // Documents
    pdf: { icon: '📄', color: 'bg-red-500', category: 'document' },
    doc: { icon: '📝', color: 'bg-blue-500', category: 'document' },
    docx: { icon: '📝', color: 'bg-blue-500', category: 'document' },
    xls: { icon: '📊', color: 'bg-green-500', category: 'document' },
    xlsx: { icon: '📊', color: 'bg-green-500', category: 'document' },
    ppt: { icon: '📽️', color: 'bg-orange-500', category: 'document' },
    pptx: { icon: '📽️', color: 'bg-orange-500', category: 'document' },
    txt: { icon: '📄', color: 'bg-gray-500', category: 'document' },
    csv: { icon: '📊', color: 'bg-green-500', category: 'document' },
    
    // Images
    jpg: { icon: '🖼️', color: 'bg-purple-500', category: 'image' },
    jpeg: { icon: '🖼️', color: 'bg-purple-500', category: 'image' },
    png: { icon: '🖼️', color: 'bg-purple-500', category: 'image' },
    gif: { icon: '🖼️', color: 'bg-purple-500', category: 'image' },
    webp: { icon: '🖼️', color: 'bg-purple-500', category: 'image' },
    svg: { icon: '🖼️', color: 'bg-purple-500', category: 'image' },
    
    // Videos
    mp4: { icon: '🎥', color: 'bg-pink-500', category: 'video' },
    avi: { icon: '🎥', color: 'bg-pink-500', category: 'video' },
    mov: { icon: '🎥', color: 'bg-pink-500', category: 'video' },
    wmv: { icon: '🎥', color: 'bg-pink-500', category: 'video' },
    flv: { icon: '🎥', color: 'bg-pink-500', category: 'video' },
    webm: { icon: '🎥', color: 'bg-pink-500', category: 'video' },
    
    // Audio
    mp3: { icon: '🎵', color: 'bg-indigo-500', category: 'audio' },
    wav: { icon: '🎵', color: 'bg-indigo-500', category: 'audio' },
    ogg: { icon: '🎵', color: 'bg-indigo-500', category: 'audio' },
    
    // Archives
    zip: { icon: '📦', color: 'bg-gray-500', category: 'archive' },
    rar: { icon: '📦', color: 'bg-gray-500', category: 'archive' },
    '7z': { icon: '📦', color: 'bg-gray-500', category: 'archive' },
  };
  
  return fileTypes[extension] || { icon: '📄', color: 'bg-gray-500', category: 'other' };
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;