import { useState } from 'react';
import { 
  FolderOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Move,
  Calendar,
  User,
  FileText,
  Folder
} from 'lucide-react';
import { Folder as FolderType } from '../types';

interface FolderCardProps {
  folder: FolderType;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const FolderCard = ({ folder, onClick, onDelete }: FolderCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบโฟลเดอร์นี้?')) {
      onDelete(folder._id);
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
    <div className="card hover-lift hover-glow cursor-pointer transition-all duration-200 group">
      <div className="card-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg"
            style={{ backgroundColor: folder.color }}
          >
            <FolderOpen className="h-8 w-8" />
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  เปิดโฟลเดอร์
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  แก้ไข
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Move className="h-4 w-4 mr-2" />
                  ย้าย
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                    setShowMenu(false);
                  }}
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
        <div className="space-y-3" onClick={onClick}>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
              {folder.name}
            </h3>
            {folder.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {folder.description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                {folder.category}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                folder.accessLevel === 'public' 
                  ? 'bg-green-100 text-green-700'
                  : folder.accessLevel === 'department'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {folder.accessLevel === 'public' ? 'สาธารณะ' : 
                 folder.accessLevel === 'department' ? 'แผนก' : 'ส่วนตัว'}
              </span>
            </div>

            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(folder.createdAt)}
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <User className="h-3 w-3 mr-1" />
              {folder.createdBy.fullName}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-1" />
              <span>{folder.documentCount} เอกสาร</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Folder className="h-4 w-4 mr-1" />
              <span>{folder.subfolderCount} โฟลเดอร์</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;