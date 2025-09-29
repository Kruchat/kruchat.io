import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Folder, 
  Download, 
  Eye, 
  TrendingUp, 
  Clock,
  Users,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { documentsApi, foldersApi } from '../services/api';
import { Document, Folder, DocumentStats, CategoryStats } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatFileSize } from '../services/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentFolders, setRecentFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load statistics
      const statsResponse = await documentsApi.getStats();
      setStats(statsResponse.data.overview);
      setCategoryStats(statsResponse.data.categories);

      // Load recent documents
      const documentsResponse = await documentsApi.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
      setRecentDocuments(documentsResponse.data.documents);

      // Load recent folders
      const foldersResponse = await foldersApi.getAll();
      setRecentFolders(foldersResponse.data.folders.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      'คณิตศาสตร์': 'คณิตศาสตร์',
      'ภาษาไทย': 'ภาษาไทย',
      'ภาษาอังกฤษ': 'ภาษาอังกฤษ',
      'วิทยาศาสตร์': 'วิทยาศาสตร์',
      'สังคมศึกษา': 'สังคมศึกษา',
      'ประวัติศาสตร์': 'ประวัติศาสตร์',
      'ภูมิศาสตร์': 'ภูมิศาสตร์',
      'ศิลปะ': 'ศิลปะ',
      'ดนตรี': 'ดนตรี',
      'พลศึกษา': 'พลศึกษา',
      'คอมพิวเตอร์': 'คอมพิวเตอร์',
      'อื่นๆ': 'อื่นๆ'
    };
    return categoryNames[category] || category;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-gray-500'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              สวัสดี, {user?.fullName}!
            </h1>
            <p className="text-primary-100 mt-1">
              ยินดีต้อนรับสู่ระบบจัดการเอกสารของคุณ
            </p>
          </div>
          <div className="hidden md:block">
            <Link
              to="/documents"
              className="btn-secondary btn-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              อัปโหลดเอกสาร
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover-lift">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">เอกสารทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalDocuments || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Folder className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">โฟลเดอร์</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentFolders.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ดาวน์โหลด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalDownloads || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">การดู</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalViews || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">เอกสารล่าสุด</h3>
              <Link
                to="/documents"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="card-content">
            {recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.category} • {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีเอกสาร</p>
                <Link
                  to="/documents"
                  className="btn-primary btn-sm mt-4"
                >
                  อัปโหลดเอกสารแรก
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Popular Categories */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">หมวดหมู่ยอดนิยม</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="card-content">
            {categoryStats.length > 0 ? (
              <div className="space-y-4">
                {categoryStats.slice(0, 5).map((category, index) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(index)}`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {getCategoryName(category._id)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{category.count} ไฟล์</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCategoryColor(index)}`}
                          style={{
                            width: `${(category.count / Math.max(...categoryStats.map(c => c.count))) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีข้อมูลหมวดหมู่</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">การดำเนินการด่วน</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/documents"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-primary-100 rounded-lg mr-3">
                <Plus className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">อัปโหลดเอกสาร</p>
                <p className="text-sm text-gray-500">เพิ่มเอกสารใหม่</p>
              </div>
            </Link>

            <Link
              to="/folders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Folder className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">สร้างโฟลเดอร์</p>
                <p className="text-sm text-gray-500">จัดระเบียบเอกสาร</p>
              </div>
            </Link>

            <Link
              to="/documents"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">ดูสถิติ</p>
                <p className="text-sm text-gray-500">ข้อมูลการใช้งาน</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;