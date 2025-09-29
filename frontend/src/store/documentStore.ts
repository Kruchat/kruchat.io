import { create } from 'zustand';
import { Document, Folder, SearchFilters, UploadProgress } from '../types';

interface DocumentStore {
  documents: Document[];
  folders: Folder[];
  selectedDocuments: string[];
  searchFilters: SearchFilters;
  uploadProgress: UploadProgress[];
  isLoading: boolean;
  currentFolder: Folder | null;
  
  // Actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  removeFolder: (id: string) => void;
  setSelectedDocuments: (ids: string[]) => void;
  toggleDocumentSelection: (id: string) => void;
  clearSelection: () => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setUploadProgress: (progress: UploadProgress[]) => void;
  updateUploadProgress: (file: File, progress: Partial<UploadProgress>) => void;
  setLoading: (loading: boolean) => void;
  setCurrentFolder: (folder: Folder | null) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  folders: [],
  selectedDocuments: [],
  searchFilters: {},
  uploadProgress: [],
  isLoading: false,
  currentFolder: null,

  setDocuments: (documents) => set({ documents }),
  
  addDocument: (document) => set((state) => ({
    documents: [document, ...state.documents]
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(doc => 
      doc._id === id ? { ...doc, ...updates } : doc
    )
  })),
  
  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter(doc => doc._id !== id)
  })),
  
  setFolders: (folders) => set({ folders }),
  
  addFolder: (folder) => set((state) => ({
    folders: [folder, ...state.folders]
  })),
  
  updateFolder: (id, updates) => set((state) => ({
    folders: state.folders.map(folder => 
      folder._id === id ? { ...folder, ...updates } : folder
    )
  })),
  
  removeFolder: (id) => set((state) => ({
    folders: state.folders.filter(folder => folder._id !== id)
  })),
  
  setSelectedDocuments: (ids) => set({ selectedDocuments: ids }),
  
  toggleDocumentSelection: (id) => set((state) => ({
    selectedDocuments: state.selectedDocuments.includes(id)
      ? state.selectedDocuments.filter(docId => docId !== id)
      : [...state.selectedDocuments, id]
  })),
  
  clearSelection: () => set({ selectedDocuments: [] }),
  
  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  updateUploadProgress: (file, progress) => set((state) => ({
    uploadProgress: state.uploadProgress.map(p => 
      p.file === file ? { ...p, ...progress } : p
    )
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setCurrentFolder: (folder) => set({ currentFolder: folder }),
}));