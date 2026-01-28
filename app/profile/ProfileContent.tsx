'use client';

import React, { useState } from 'react';
import { User, Lock, Save, X, Edit2, LucideIcon } from 'lucide-react';
import { PersonalInfoState, SecurityState, TabType } from './types';
import { ProfileHeader } from './components/ProfileHeader';
import { PersonalForm } from './components/PersonalForm';
import { SecurityForm } from './components/SecurityForm';

// تعريف الانترفيس للأزرار
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

const ProfileContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditing, setIsEditing] = useState(false); // حالة التعديل

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoState>({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fashion Street',
    dob: '1990-05-15',
    country: 'United States',
    city: 'New York',
  });

  const [security, setSecurity] = useState<SecurityState>({
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });

  // عند تغيير التاب، نلغي وضع التعديل
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving...', activeTab === 'personal' ? personalInfo : security);
    alert('Changes saved successfully!');
    setIsEditing(false); // العودة لوضع العرض بعد الحفظ
  };

  const handleCancel = () => {
    setIsEditing(false); // إلغاء التعديل
    // هنا يمكنك إضافة منطق لاسترجاع البيانات الأصلية إذا أردت
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <ProfileHeader />

      {/* Tab System */}
      <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl mb-6 w-fit mx-auto md:mx-0 border border-gray-200">
        <TabButton
          active={activeTab === 'personal'}
          onClick={() => handleTabChange('personal')}
          icon={User}
          label="Personal Info"
        />
        <TabButton
          active={activeTab === 'security'}
          onClick={() => handleTabChange('security')}
          icon={Lock}
          label="Security"
        />
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {activeTab === 'personal' ? 'Personal Details' : 'Password & Security'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'personal'
                ? 'Update your personal information and address.'
                : 'Manage your password and account security settings.'}
            </p>
          </div>

          {/* زر التعديل يظهر فقط هنا إذا لم نكن في وضع التعديل */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Edit2 size={16} />
              Edit Details
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-8">
          {activeTab === 'personal' ? (
            <PersonalForm
              data={personalInfo}
              onChange={handlePersonalChange}
              isEditing={isEditing}
            />
          ) : (
            <SecurityForm
              data={security}
              onChange={handleSecurityChange}
              isEditing={isEditing}
            />
          )}

          {/* Actions Footer - يظهر فقط في وضع التعديل */}
          {isEditing && (
            <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-200"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Helper Component
const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all
      ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
    `}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default ProfileContent;