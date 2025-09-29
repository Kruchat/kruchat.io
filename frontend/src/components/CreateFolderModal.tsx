import { useState } from 'react';
import { X, Folder, Palette } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface CreateFolderModalProps {
  onClose: () => void;
  onSubmit: (folderData: Partial<FolderType>) => void;
  parentFolder?: FolderType | null;
}

const CreateFolderModal = ({ onClose, onSubmit, parentFolder }: CreateFolderModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'อื่นๆ',
    subject: '',
    accessLevel: 'private' as 'private' | 'department' | 'public',
    color: '#3B82F6',
    icon: 'folder'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อโฟลเดอร์');
      return;
    }

    onSubmit(formData);
  };

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#64748B', // Gray
  ];

  const icons = [
    'folder',
    'folder-open',
    'archive',
    'book',
    'graduation-cap',
    'users',
    'calendar',
    'star',
    'heart',
    'bookmark'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">สร้างโฟลเดอร์ใหม่</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Folder Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อโฟลเดอร์ *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Folder className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="กรอกชื่อโฟลเดอร์"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="input resize-none"
                  placeholder="กรอกคำอธิบายโฟลเดอร์"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                  <option value="ภาษาไทย">ภาษาไทย</option>
                  <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
                  <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
                  <option value="สังคมศึกษา">สังคมศึกษา</option>
                  <option value="ประวัติศาสตร์">ประวัติศาสตร์</option>
                  <option value="ภูมิศาสตร์">ภูมิศาสตร์</option>
                  <option value="ศิลปะ">ศิลปะ</option>
                  <option value="ดนตรี">ดนตรี</option>
                  <option value="พลศึกษา">พลศึกษา</option>
                  <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  วิชา
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input"
                  placeholder="กรอกวิชา"
                />
              </div>

              {/* Access Level */}
              <div>
                <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  ระดับการเข้าถึง
                </label>
                <select
                  id="accessLevel"
                  name="accessLevel"
                  value={formData.accessLevel}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="private">ส่วนตัว</option>
                  <option value="department">แผนก</option>
                  <option value="public">สาธารณะ</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สีโฟลเดอร์
                </label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-lg border-2 border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-6 h-6 rounded border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Parent Folder Info */}
              {parentFolder && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>โฟลเดอร์แม่:</strong> {parentFolder.name}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline btn-md"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn-primary btn-md"
              >
                สร้างโฟลเดอร์
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;