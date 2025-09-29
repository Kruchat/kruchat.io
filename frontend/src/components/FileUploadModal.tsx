import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { documentsApi } from '../services/api';
import { Folder, UploadProgress } from '../types';
import LoadingSpinner from './ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface FileUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  folders: Folder[];
}

const FileUploadModal = ({ onClose, onSuccess, folders }: FileUploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'อื่นๆ',
    subject: '',
    tags: '',
    folderId: '',
    accessLevel: 'private' as 'private' | 'department' | 'public'
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(file => {
      // Check if file already exists
      return !files.some(f => f.name === file.name && f.size === file.size);
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Initialize upload progress
    const newProgress = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));
    setUploadProgress(prev => [...prev, ...newProgress]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด');
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadFormData = new FormData();
      
      // Add files
      files.forEach(file => {
        uploadFormData.append('files', file);
      });
      
      // Add metadata
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('tags', formData.tags);
      if (formData.folderId) {
        uploadFormData.append('folderId', formData.folderId);
      }
      uploadFormData.append('accessLevel', formData.accessLevel);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev.map(p => ({
          ...p,
          progress: Math.min(p.progress + Math.random() * 20, 90)
        })));
      }, 500);

      const response = await documentsApi.upload(uploadFormData);
      
      clearInterval(progressInterval);
      
      // Complete progress
      setUploadProgress(prev => prev.map(p => ({
        ...p,
        progress: 100,
        status: 'completed' as const
      })));

      toast.success(`อัปโหลด ${files.length} ไฟล์สำเร็จ`);
      onSuccess();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Mark as error
      setUploadProgress(prev => prev.map(p => ({
        ...p,
        status: 'error' as const,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลด'
      })));
      
      toast.error('ไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      txt: '📄',
      csv: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      mp3: '🎵',
      wav: '🎵',
      zip: '📦',
      rar: '📦'
    };
    return iconMap[extension || ''] || '📄';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">อัปโหลดเอกสาร</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกไฟล์
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-primary-600">วางไฟล์ที่นี่...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        ลากและวางไฟล์ที่นี่ หรือ <span className="text-primary-600">คลิกเพื่อเลือกไฟล์</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        รองรับ PDF, Word, Excel, PowerPoint, รูปภาพ, วิดีโอ, เสียง และไฟล์บีบอัด
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ไฟล์ที่เลือก ({files.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => {
                      const progress = uploadProgress[index];
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-2xl">{getFileIcon(file)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                            {progress && (
                              <div className="mt-1">
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        progress.status === 'completed'
                                          ? 'bg-green-500'
                                          : progress.status === 'error'
                                          ? 'bg-red-500'
                                          : 'bg-primary-500'
                                      }`}
                                      style={{ width: `${progress.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {progress.progress.toFixed(0)}%
                                  </span>
                                </div>
                                {progress.status === 'error' && progress.error && (
                                  <p className="text-xs text-red-500 mt-1">{progress.error}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อเอกสาร
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="กรอกชื่อเอกสาร (ถ้าไม่กรอกจะใช้ชื่อไฟล์)"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
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
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input"
                    placeholder="กรอกวิชา"
                  />
                </div>

                {/* Folder */}
                <div>
                  <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 mb-2">
                    โฟลเดอร์
                  </label>
                  <select
                    id="folderId"
                    value={formData.folderId}
                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                    className="input"
                  >
                    <option value="">ไม่ระบุโฟลเดอร์</option>
                    {folders.map(folder => (
                      <option key={folder._id} value={folder._id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Access Level */}
                <div>
                  <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    ระดับการเข้าถึง
                  </label>
                  <select
                    id="accessLevel"
                    value={formData.accessLevel}
                    onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value as any })}
                    className="input"
                  >
                    <option value="private">ส่วนตัว</option>
                    <option value="department">แผนก</option>
                    <option value="public">สาธารณะ</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input resize-none"
                    placeholder="กรอกคำอธิบายเอกสาร"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    แท็ก
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="input"
                    placeholder="กรอกแท็ก (คั่นด้วยจุลภาค)"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline btn-md"
                disabled={isUploading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isUploading || files.length === 0}
                className="btn-primary btn-md"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    กำลังอัปโหลด...
                  </div>
                ) : (
                  'อัปโหลด'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;