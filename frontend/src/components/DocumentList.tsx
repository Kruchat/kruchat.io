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

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onDelete: (id: string) => void;
}

const DocumentList = ({ 
  documents, 
  selectedDocuments, 
  onSelect, 
  onSelectAll, 
  onDelete 
}: DocumentListProps) => {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(documentId));
      const response = await documentsApi.download(documentId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('ดาวน์โหลดสำเร็จ');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('ไม่สามารถดาวน์โหลดไฟล์ได้');
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const handleDelete = (documentId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?')) {
      onDelete(documentId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isAllSelected = documents.length > 0 && selectedDocuments.length === documents.length;
  const isIndeterminate = selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={onSelectAll}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              เอกสาร
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              หมวดหมู่
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ขนาด
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              อัปโหลดโดย
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              วันที่
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถิติ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              การดำเนินการ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document) => {
            const fileTypeInfo = getFileTypeInfo(document.originalName, document.mimeType);
            const isDownloading = downloadingIds.has(document._id);
            const isMenuOpen = menuOpenId === document._id;

            return (
              <tr 
                key={document._id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedDocuments.includes(document._id) ? 'bg-primary-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document._id)}
                    onChange={() => onSelect(document._id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg mr-4 ${fileTypeInfo.color}`}>
                      {fileTypeInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {document.originalName}
                      </p>
                      {document.description && (
                        <p className="text-xs text-gray-400 truncate">
                          {document.description}
                        </p>
                      )}
                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {document.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {document.tags.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{document.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{document.category}</span>
                    {document.subject && (
                      <span className="text-xs text-gray-500">{document.subject}</span>
                    )}
                    {document.folder && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Folder className="h-3 w-3 mr-1" />
                        {document.folder.name}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatFileSize(document.fileSize)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-white">
                        {document.uploadedBy.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{document.uploadedBy.fullName}</p>
                      <p className="text-xs text-gray-500">{document.uploadedBy.username}</p>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(document.createdAt)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {document.viewCount}
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {document.downloadCount}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(isMenuOpen ? null : document._id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            handleDownload(document._id, document.originalName);
                            setMenuOpenId(null);
                          }}
                          disabled={isDownloading}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isDownloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด'}
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(document._id);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          ลบ
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;