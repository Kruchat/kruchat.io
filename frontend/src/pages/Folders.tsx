import { useEffect, useState } from 'react';
import { 
  Folder, 
  Plus, 
  Search, 
  Grid, 
  List, 
  MoreVertical,
  Edit,
  Trash2,
  Move,
  FolderOpen
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { foldersApi } from '../services/api';
import { Folder as FolderType } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FolderCard from '../components/FolderCard';
import CreateFolderModal from '../components/CreateFolderModal';
import toast from 'react-hot-toast';

const Folders = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([]);

  const { folders, setFolders, addFolder, updateFolder, removeFolder } = useDocumentStore();

  useEffect(() => {
    loadFolders();
  }, [currentFolder]);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const response = await foldersApi.getAll({
        parentFolder: currentFolder?._id,
        search: searchQuery || undefined
      });
      setFolders(response.data.folders);
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error('ไม่สามารถโหลดโฟลเดอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (folderData: Partial<FolderType>) => {
    try {
      const response = await foldersApi.create({
        ...folderData,
        parentFolder: currentFolder?._id
      });
      addFolder(response.data.folder);
      setShowCreateModal(false);
      toast.success('สร้างโฟลเดอร์สำเร็จ');
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถสร้างโฟลเดอร์ได้');
    }
  };

  const handleFolderClick = (folder: FolderType) => {
    setCurrentFolder(folder);
    setBreadcrumbs(prev => [...prev, folder]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(index === -1 ? null : newBreadcrumbs[index]);
  };

  const handleFolderDelete = async (folderId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบโฟลเดอร์นี้? เอกสารและโฟลเดอร์ย่อยทั้งหมดจะถูกลบด้วย')) {
      return;
    }

    try {
      await foldersApi.delete(folderId);
      removeFolder(folderId);
      toast.success('ลบโฟลเดอร์สำเร็จ');
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถลบโฟลเดอร์ได้');
    }
  };

  const filteredFolders = folders.filter(folder => 
    !searchQuery || folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">โฟลเดอร์</h1>
          <p className="text-gray-600 mt-1">
            จัดระเบียบเอกสารของคุณด้วยโฟลเดอร์
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          สร้างโฟลเดอร์
        </button>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="card">
          <div className="card-content">
            <nav className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="text-primary-600 hover:text-primary-700 flex items-center"
              >
                <Folder className="h-4 w-4 mr-1" />
                หน้าหลัก
              </button>
              {breadcrumbs.map((folder, index) => (
                <div key={folder._id} className="flex items-center space-x-2">
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Search and Controls */}
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
                  placeholder="ค้นหาโฟลเดอร์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

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
      </div>

      {/* Folders Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredFolders.length > 0 ? (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFolders.map((folder) => (
                <FolderCard
                  key={folder._id}
                  folder={folder}
                  onClick={() => handleFolderClick(folder)}
                  onDelete={handleFolderDelete}
                />
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="card-content p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อโฟลเดอร์
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          หมวดหมู่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เอกสาร
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สร้างโดย
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่สร้าง
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFolders.map((folder) => (
                        <tr key={folder._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white mr-4"
                                style={{ backgroundColor: folder.color }}
                              >
                                <FolderOpen className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {folder.name}
                                </div>
                                {folder.description && (
                                  <div className="text-sm text-gray-500">
                                    {folder.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                              {folder.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {folder.documentCount} เอกสาร
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-white">
                                  {folder.createdBy.fullName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm text-gray-900">{folder.createdBy.fullName}</div>
                                <div className="text-xs text-gray-500">{folder.createdBy.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(folder.createdAt).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleFolderClick(folder)}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                เปิด
                              </button>
                              <button
                                onClick={() => handleFolderDelete(folder._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'ไม่พบโฟลเดอร์ที่ค้นหา' : 'ยังไม่มีโฟลเดอร์'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? 'ลองค้นหาด้วยคำอื่น' 
                  : 'เริ่มต้นด้วยการสร้างโฟลเดอร์แรกของคุณ'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary btn-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างโฟลเดอร์
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <CreateFolderModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFolder}
          parentFolder={currentFolder}
        />
      )}
    </div>
  );
};

export default Folders;