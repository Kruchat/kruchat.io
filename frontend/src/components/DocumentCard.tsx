import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  MoreVertical, 
  Calendar,
  User,
  Folder,
  Tag
} from 'lucide-react';
import { Document } from '../types';
import { documentsApi, getFileTypeInfo, formatFileSize } from '../services/api';
import toast from 'react-hot-toast';

interface DocumentCardProps {
  document: Document;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const DocumentCard = ({ document, isSelected, onSelect, onDelete }: DocumentCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fileTypeInfo = getFileTypeInfo(document.originalName, document.mimeType);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await documentsApi.download(document._id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('ดาวน์โหลดสำเร็จ');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('ไม่สามารถดาวน์โหลดไฟล์ได้');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?')) {
      onDelete(document._id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`card hover-lift hover-glow cursor-pointer transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
    }`}>
      <div className="card-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(document._id)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${fileTypeInfo.color}`}>
              {fileTypeInfo.icon}
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด'}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  ลบ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
              {document.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {document.description || 'ไม่มีคำอธิบาย'}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(document.createdAt)}
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              {document.uploadedBy.fullName}
            </div>
            
            {document.folder && (
              <div className="flex items-center text-xs text-gray-500">
                <Folder className="h-3 w-3 mr-1" />
                {document.folder.name}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(document.fileSize)}</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {document.viewCount}
                </div>
                <div className="flex items-center">
                  <Download className="h-3 w-3 mr-1" />
                  {document.downloadCount}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{document.tags.length - 3} อื่นๆ
                </span>
              )}
            </div>
          )}

          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
              {document.category}
            </span>
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              document.accessLevel === 'public' 
                ? 'bg-green-100 text-green-700'
                : document.accessLevel === 'department'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {document.accessLevel === 'public' ? 'สาธารณะ' : 
               document.accessLevel === 'department' ? 'แผนก' : 'ส่วนตัว'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;