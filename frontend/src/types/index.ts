export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'teacher' | 'admin';
  department?: string;
  subjects: string[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  lastLogin?: string;
}

export interface Document {
  _id: string;
  title: string;
  description: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string;
  fileExtension: string;
  category: string;
  subject: string;
  tags: string[];
  folder?: {
    _id: string;
    name: string;
    path: string;
  };
  uploadedBy: {
    _id: string;
    username: string;
    fullName: string;
  };
  accessLevel: 'private' | 'department' | 'public';
  allowedUsers: User[];
  version: number;
  parentDocument?: string;
  versions: DocumentVersion[];
  downloadCount: number;
  viewCount: number;
  isActive: boolean;
  thumbnail?: string;
  metadata: {
    author?: string;
    created?: string;
    modified?: string;
    pages?: number;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  version: number;
  filePath: string;
  uploadedAt: string;
  uploadedBy: string;
  changeNote: string;
}

export interface Folder {
  _id: string;
  name: string;
  description: string;
  parentFolder?: {
    _id: string;
    name: string;
    path: string;
  };
  path: string;
  createdBy: {
    _id: string;
    username: string;
    fullName: string;
  };
  category: string;
  subject: string;
  accessLevel: 'private' | 'department' | 'public';
  allowedUsers: User[];
  color: string;
  icon: string;
  isActive: boolean;
  documentCount: number;
  subfolderCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  totalDownloads: number;
  totalViews: number;
  totalFolders: number;
}

export interface CategoryStats {
  _id: string;
  count: number;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface SearchFilters {
  category?: string;
  subject?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  accessLevel?: string;
}

export interface Pagination {
  current: number;
  pages: number;
  total: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface DocumentResponse {
  documents: Document[];
  pagination: Pagination;
}

export interface FolderResponse {
  folders: Folder[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  department?: string;
  subjects?: string[];
}

export interface UploadRequest {
  files: File[];
  title?: string;
  description?: string;
  category: string;
  subject?: string;
  tags?: string;
  folderId?: string;
  accessLevel: 'private' | 'department' | 'public';
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface FileTypeInfo {
  extension: string;
  mimeType: string;
  icon: string;
  color: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
}