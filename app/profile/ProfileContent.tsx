/**
 * Profile Content - With Zod Validation
 * User profile management with validated forms for personal info and password changes
 */

'use client';

import React, { useState } from 'react';
import { User, Lock, Save, X, Edit2, LucideIcon } from 'lucide-react';
import { updateProfileSchema, updatePasswordSchema, type UpdateProfileInput, type UpdatePasswordInput } from '@/lib/validation/schemas';
import { FormField } from '@/components/ui/FormField';
import { ProfileHeader } from './components/ProfileHeader';

type TabType = 'personal' | 'security';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

const ProfileContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditing, setIsEditing] = useState(false);

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState<UpdateProfileInput>({
    name: 'John Doe',
    email: 'john.doe@example.com',
  });

  const [personalErrors, setPersonalErrors] = useState<Partial<Record<keyof UpdateProfileInput, string>>>({});

  // Security
  const [security, setSecurity] = useState<UpdatePasswordInput>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [securityErrors, setSecurityErrors] = useState<Partial<Record<keyof UpdatePasswordInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsEditing(false);
    setServerError(null);
    setSuccessMessage(null);
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
    if (personalErrors[name as keyof UpdateProfileInput]) {
      setPersonalErrors({ ...personalErrors, [name]: undefined });
    }
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurity({ ...security, [name]: value });
    if (securityErrors[name as keyof UpdatePasswordInput]) {
      setSecurityErrors({ ...securityErrors, [name]: undefined });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (activeTab === 'personal') {
      // Validate personal info
      const result = updateProfileSchema.safeParse(personalInfo);

      if (!result.success) {
        const errors: Partial<Record<keyof UpdateProfileInput, string>> = {};
        result.error.issues.forEach((err) => {
          const field = err.path[0] as keyof UpdateProfileInput;
          errors[field] = err.message;
        });
        setPersonalErrors(errors);
        return;
      }

      // Submit personal info
      console.log('Saving personal info:', result.data);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

    } else {
      // Validate password
      const result = updatePasswordSchema.safeParse(security);

      if (!result.success) {
        const errors: Partial<Record<keyof UpdatePasswordInput, string>> = {};
        result.error.issues.forEach((err) => {
          const field = err.path[0] as keyof UpdatePasswordInput;
          errors[field] = err.message;
        });
        setSecurityErrors(errors);
        return;
      }

      // Submit password change
      console.log('Changing password');
      setSuccessMessage('Password changed successfully!');
      setSecurity({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPersonalErrors({});
    setSecurityErrors({});
    setServerError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <ProfileHeader />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </p>
        </div>
      )}

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {serverError}
          </p>
        </div>
      )}

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

      {/* Forms Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {/* Edit/Cancel Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'personal' ? 'Personal Information' : 'Change Password'}
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Edit2 size={16} />
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave}>
          {activeTab === 'personal' ? (
            <div className="space-y-4">
              <FormField
                label="Full Name"
                name="name"
                value={personalInfo.name}
                onChange={handlePersonalChange}
                error={personalErrors.name}
                placeholder="John Doe"
                disabled={!isEditing}
                required
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={personalInfo.email}
                onChange={handlePersonalChange}
                error={personalErrors.email}
                placeholder="john.doe@example.com"
                disabled={!isEditing}
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <FormField
                label="Current Password"
                name="oldPassword"
                type="password"
                value={security.oldPassword}
                onChange={handleSecurityChange}
                error={securityErrors.oldPassword}
                placeholder="Enter current password"
                disabled={!isEditing}
                required
              />

              <FormField
                label="New Password"
                name="newPassword"
                type="password"
                value={security.newPassword}
                onChange={handleSecurityChange}
                error={securityErrors.newPassword}
                placeholder="Enter new password (min 8 characters)"
                disabled={!isEditing}
                required
              />

              <FormField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={security.confirmPassword}
                onChange={handleSecurityChange}
                error={securityErrors.confirmPassword}
                placeholder="Re-enter new password"
                disabled={!isEditing}
                required
              />

              {isEditing && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Password Requirements:</strong> At least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
              )}
            </div>
          )}

          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-medium"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all text-sm
      ${active
        ? 'bg-white text-blue-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
      }
    `}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default ProfileContent;