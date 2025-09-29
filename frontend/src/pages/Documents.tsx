import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Trash2, 
  Eye,
  MoreVertical,
  FileText,
  Folder,
  Plus
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { documentsApi, foldersApi, getFileTypeInfo, formatFileSize } from '../services/api';
import { Document, Folder, SearchFilters } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FileUploadModal from '../components/FileUploadModal';
import DocumentCard from '../components/DocumentCard';
import DocumentList from '../components/DocumentList';
import SearchFiltersComponent from '../components/SearchFiltersComponent';
import toast from 'react-hot-toast';

const Documents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    documents,
    folders,
    searchFilters,
    setDocuments,
    setFolders,
    setSearchFilters,
    setSelectedDocuments: setStoreSelectedDocuments,
    clearSelection
  } = useDocumentStore();

  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, [searchFilters, currentPage]);

  useEffect(() => {
    // Sync URL params with search filters
    const urlFilters: SearchFilters = {};
    if (searchParams.get('search')) urlFilters.search = searchParams.get('search') || undefined;
    if (searchParams.get('category')) urlFilters.category = searchParams.get('category') || undefined;
    if (searchParams.get('subject')) urlFilters.subject = searchParams.get('subject') || undefined;
    if (searchParams.get('sortBy')) urlFilters.sortBy = searchParams.get('sortBy') || undefined;
    if (searchParams.get('sortOrder')) urlFilters.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
    
    setSearchFilters(urlFilters);
  }, [searchParams]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentsApi.getAll({
        page: currentPage,
        limit: 20,
        ...searchFilters
      });
      
      setDocuments(response.data.documents);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('ไม่สามารถโหลดเอกสารได้');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await foldersApi.getAll();
      setFolders(response.data.folders);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const handleSearch = (query: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (query) {
      newSearchParams.set('search', query);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: Partial<SearchFilters>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    setSearchParams(newSearchParams);
    setCurrentPage(1);
  };

  const handleDocumentSelect = (id: string) => {
    const newSelection = selectedDocuments.includes(id)
      ? selectedDocuments.filter(docId => docId !== id)
      : [...selectedDocuments, id];
    
    setSelectedDocuments(newSelection);
    setStoreSelectedDocuments(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
      setStoreSelectedDocuments([]);
    } else {
      const allIds = documents.map(doc => doc._id);
      setSelectedDocuments(allIds);
      setStoreSelectedDocuments(allIds);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('กรุณาเลือกเอกสารที่ต้องการดาวน์โหลด');
      return;
    }

    try {
      const response = await documentsApi.bulkDownload(selectedDocuments);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documents-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`ดาวน์โหลด ${selectedDocuments.length} เอกสารสำเร็จ`);
      clearSelection();
    } catch (error) {
      console.error('Error downloading documents:', error);
      toast.error('ไม่สามารถดาวน์โหลดเอกสารได้');
    }
  };

  const handleDocumentDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?')) return;

    try {
      await documentsApi.delete(id);
      setDocuments(documents.filter(doc => doc._id !== id));
      toast.success('ลบเอกสารสำเร็จ');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('ไม่สามารถลบเอกสารได้');
    }
  };

  const handleUploadSuccess = () => {
    loadDocuments();
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เอกสาร</h1>
          <p className="text-gray-600 mt-1">
            จัดการเอกสารและไฟล์ของคุณ
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          อัปโหลดเอกสาร
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาเอกสาร..."
                  defaultValue={searchFilters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline btn-sm ${showFilters ? 'bg-primary-50 border-primary-300' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                ตัวกรอง
              </button>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <SearchFiltersComponent
                filters={searchFilters}
                onFilterChange={handleFilterChange}
                folders={folders}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="card bg-primary-50 border-primary-200">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-primary-700">
                  เลือกแล้ว {selectedDocuments.length} เอกสาร
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {selectedDocuments.length === documents.length ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDownload}
                  className="btn-primary btn-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ดาวน์โหลด
                </button>
                <button
                  onClick={clearSelection}
                  className="btn-outline btn-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid-responsive">
              {documents.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  isSelected={selectedDocuments.includes(document._id)}
                  onSelect={handleDocumentSelect}
                  onDelete={handleDocumentDelete}
                />
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="card-content p-0">
                <DocumentList
                  documents={documents}
                  selectedDocuments={selectedDocuments}
                  onSelect={handleDocumentSelect}
                  onSelectAll={handleSelectAll}
                  onDelete={handleDocumentDelete}
                />
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              
              <span className="text-sm text-gray-600">
                หน้า {currentPage} จาก {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline btn-sm disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ไม่พบเอกสาร
              </h3>
              <p className="text-gray-500 mb-6">
                เริ่มต้นด้วยการอัปโหลดเอกสารแรกของคุณ
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary btn-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                อัปโหลดเอกสาร
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          folders={folders}
        />
      )}
    </div>
  );
};

export default Documents;