import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  Save, 
  Key, 
  Bell,
  Palette,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../services/api';
import { User as UserType, DocumentStats } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DocumentStats | null>(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    department: user?.department || '',
    subjects: user?.subjects?.join(', ') || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'th',
    notifications: {
      email: user?.preferences?.notifications?.email || true,
      push: user?.preferences?.notifications?.push || true,
    }
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      const response = await usersApi.getById(user.id);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const subjectsArray = profileData.subjects
        ? profileData.subjects.split(',').map(s => s.trim()).filter(s => s)
        : [];

      await updateProfile({
        fullName: profileData.fullName,
        department: profileData.department,
        subjects: subjectsArray,
      });
      
      toast.success('อัปเดตโปรไฟล์สำเร็จ');
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setIsLoading(true);
      await updateProfile({ preferences });
      toast.success('อัปเดตการตั้งค่าสำเร็จ');
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถอัปเดตการตั้งค่าได้');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'โปรไฟล์', icon: User },
    { id: 'password', label: 'รหัสผ่าน', icon: Key },
    { id: 'preferences', label: 'การตั้งค่า', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์</h1>
          <p className="text-gray-600 mt-1">
            จัดการข้อมูลส่วนตัวและการตั้งค่าของคุณ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-content">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.fullName}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700 mt-2">
                  {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ครู'}
                </span>
              </div>

              {/* Stats */}
              {stats && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">เอกสาร</span>
                    <span className="font-medium">{stats.totalDocuments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">โฟลเดอร์</span>
                    <span className="font-medium">{stats.totalFolders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ดาวน์โหลด</span>
                    <span className="font-medium">{stats.totalDownloads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">การดู</span>
                    <span className="font-medium">{stats.totalViews}</span>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-content">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">ข้อมูลโปรไฟล์</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อ-นามสกุล *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="fullName"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            className="input pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Email (Read-only) */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          อีเมล
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            value={user?.email || ''}
                            className="input pl-10 bg-gray-50"
                            disabled
                          />
                        </div>
                      </div>

                      {/* Department */}
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                          ภาควิชา/แผนก
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="department"
                            value={profileData.department}
                            onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                            className="input pl-10"
                            placeholder="กรอกภาควิชา/แผนก"
                          />
                        </div>
                      </div>

                      {/* Username (Read-only) */}
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อผู้ใช้
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="username"
                            value={user?.username || ''}
                            className="input pl-10 bg-gray-50"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subjects */}
                    <div>
                      <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-2">
                        วิชาที่สอน
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                          <GraduationCap className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          id="subjects"
                          rows={3}
                          value={profileData.subjects}
                          onChange={(e) => setProfileData({ ...profileData, subjects: e.target.value })}
                          className="input pl-10 resize-none"
                          placeholder="กรอกวิชาที่สอน (คั่นด้วยจุลภาค)"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        เช่น คณิตศาสตร์, ภาษาไทย, ภาษาอังกฤษ
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary btn-md"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            กำลังบันทึก...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="h-4 w-4 mr-2" />
                            บันทึก
                          </div>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">เปลี่ยนรหัสผ่าน</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="max-w-md">
                      {/* Current Password */}
                      <div className="mb-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          รหัสผ่านปัจจุบัน *
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="input"
                          required
                        />
                      </div>

                      {/* New Password */}
                      <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          รหัสผ่านใหม่ *
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="input"
                          required
                          minLength={6}
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          ยืนยันรหัสผ่านใหม่ *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="input"
                          required
                          minLength={6}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary btn-md"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            กำลังเปลี่ยน...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Key className="h-4 w-4 mr-2" />
                            เปลี่ยนรหัสผ่าน
                          </div>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">การตั้งค่า</h2>
                  
                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Palette className="h-4 w-4 inline mr-2" />
                        ธีม
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={preferences.theme === 'light'}
                            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' })}
                            className="mr-2"
                          />
                          ธีมสว่าง
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={preferences.theme === 'dark'}
                            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' })}
                            className="mr-2"
                          />
                          ธีมมืด
                        </label>
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="h-4 w-4 inline mr-2" />
                        ภาษา
                      </label>
                      <select
                        id="language"
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="input max-w-xs"
                      >
                        <option value="th">ไทย</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    {/* Notifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Bell className="h-4 w-4 inline mr-2" />
                        การแจ้งเตือน
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.notifications.email}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, email: e.target.checked }
                            })}
                            className="mr-3"
                          />
                          รับการแจ้งเตือนทางอีเมล
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.notifications.push}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, push: e.target.checked }
                            })}
                            className="mr-3"
                          />
                          รับการแจ้งเตือนแบบ Push
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handlePreferencesUpdate}
                        disabled={isLoading}
                        className="btn-primary btn-md"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            กำลังบันทึก...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="h-4 w-4 mr-2" />
                            บันทึกการตั้งค่า
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;