import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';

const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    emergency_contact: '',
    emergency_phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        emergency_contact: (user as any).emergency_contact || '',
        emergency_phone: (user as any).emergency_phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.current_password) {
      showNotification('Please enter your current password for security', 'error');
      return;
    }

    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (formData.new_password && formData.new_password.length < 6) {
      showNotification('New password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone
      };

      if (formData.new_password) {
        updateData.new_password = formData.new_password;
      }

      const success = await updateProfile(updateData, formData.current_password);
      
      if (success) {
        showNotification('Profile updated successfully!', 'success');
        setIsEditing(false);
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
      }
    } catch (error: any) {
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        emergency_contact: (user as any).emergency_contact || '',
        emergency_phone: (user as any).emergency_phone || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.username}
                </h1>
                <p className="text-blue-100">@{user.username}</p>
                <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded-full mt-1">
                  {user.user_type === 'driver' ? 'Driver' : user.user_type}
                </span>
              </div>
            </div>
            
            {!isEditing && (
              <motion.button
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/30 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit Profile</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact & Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                {isEditing && (
                  <>
                    <hr className="my-6" />
                    <h4 className="text-md font-medium text-gray-900 mb-4">Security</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="current_password"
                          value={formData.current_password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter current password"
                          required
                        />
                        <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password (optional)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="new_password"
                          value={formData.new_password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter new password"
                        />
                        <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {formData.new_password && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Confirm new password"
                          />
                          <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
              <motion.button
                type="button"
                onClick={handleCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Cancel</span>
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center space-x-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;