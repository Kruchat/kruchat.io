import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { SearchFilters, Folder } from '../types';

interface SearchFiltersComponentProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  folders: Folder[];
}

const SearchFiltersComponent = ({ 
  filters, 
  onFilterChange, 
  folders 
}: SearchFiltersComponentProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['category']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const categories = [
    'คณิตศาสตร์',
    'ภาษาไทย', 
    'ภาษาอังกฤษ',
    'วิทยาศาสตร์',
    'สังคมศึกษา',
    'ประวัติศาสตร์',
    'ภูมิศาสตร์',
    'ศิลปะ',
    'ดนตรี',
    'พลศึกษา',
    'คอมพิวเตอร์',
    'อื่นๆ'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'วันที่อัปโหลด' },
    { value: 'title', label: 'ชื่อเอกสาร' },
    { value: 'fileSize', label: 'ขนาดไฟล์' },
    { value: 'downloadCount', label: 'จำนวนดาวน์โหลด' },
    { value: 'viewCount', label: 'จำนวนการดู' }
  ];

  const accessLevels = [
    { value: 'private', label: 'ส่วนตัว' },
    { value: 'department', label: 'แผนก' },
    { value: 'public', label: 'สาธารณะ' }
  ];

  const clearFilter = (key: keyof SearchFilters) => {
    onFilterChange({ [key]: undefined });
  };

  const clearAllFilters = () => {
    onFilterChange({
      category: undefined,
      subject: undefined,
      accessLevel: undefined,
      sortBy: undefined,
      sortOrder: undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">ตัวกรอง</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
          >
            หมวดหมู่
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${
                expandedSections.has('category') ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('category') && (
            <div className="space-y-2">
              <select
                value={filters.category || ''}
                onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
                className="input text-sm"
              >
                <option value="">ทั้งหมด</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {filters.category && (
                <button
                  onClick={() => clearFilter('category')}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  ล้าง
                </button>
              )}
            </div>
          )}
        </div>

        {/* Subject Filter */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('subject')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
          >
            วิชา
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${
                expandedSections.has('subject') ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('subject') && (
            <div className="space-y-2">
              <input
                type="text"
                value={filters.subject || ''}
                onChange={(e) => onFilterChange({ subject: e.target.value || undefined })}
                placeholder="กรอกชื่อวิชา"
                className="input text-sm"
              />
              {filters.subject && (
                <button
                  onClick={() => clearFilter('subject')}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  ล้าง
                </button>
              )}
            </div>
          )}
        </div>

        {/* Folder Filter */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('folder')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
          >
            โฟลเดอร์
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${
                expandedSections.has('folder') ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('folder') && (
            <div className="space-y-2">
              <select
                value={filters.folderId || ''}
                onChange={(e) => onFilterChange({ folderId: e.target.value || undefined })}
                className="input text-sm"
              >
                <option value="">ทั้งหมด</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              {filters.folderId && (
                <button
                  onClick={() => clearFilter('folderId')}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  ล้าง
                </button>
              )}
            </div>
          )}
        </div>

        {/* Access Level Filter */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('accessLevel')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
          >
            ระดับการเข้าถึง
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${
                expandedSections.has('accessLevel') ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('accessLevel') && (
            <div className="space-y-2">
              <select
                value={filters.accessLevel || ''}
                onChange={(e) => onFilterChange({ accessLevel: e.target.value || undefined })}
                className="input text-sm"
              >
                <option value="">ทั้งหมด</option>
                {accessLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {filters.accessLevel && (
                <button
                  onClick={() => clearFilter('accessLevel')}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  ล้าง
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          เรียงลำดับ
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${
              expandedSections.has('sort') ? 'rotate-180' : ''
            }`} 
          />
        </button>
        
        {expandedSections.has('sort') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">เรียงตาม</label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                className="input text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ทิศทาง</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="input text-sm"
              >
                <option value="desc">มากไปน้อย</option>
                <option value="asc">น้อยไปมาก</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">ตัวกรองที่ใช้งาน</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                หมวดหมู่: {filters.category}
                <button
                  onClick={() => clearFilter('category')}
                  className="ml-1 hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.subject && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                วิชา: {filters.subject}
                <button
                  onClick={() => clearFilter('subject')}
                  className="ml-1 hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.accessLevel && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                ระดับ: {accessLevels.find(l => l.value === filters.accessLevel)?.label}
                <button
                  onClick={() => clearFilter('accessLevel')}
                  className="ml-1 hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFiltersComponent;