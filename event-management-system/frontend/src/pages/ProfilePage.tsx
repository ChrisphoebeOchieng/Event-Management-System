import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { profileService, ProfileData } from '../services/profileService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  CameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    profile_picture: '',
  });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          profile_picture: data.profile_picture || '',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileService.updateProfile(profile);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Update the user context
      if (user) {
        updateUser({
          first_name: profile.first_name,
          last_name: profile.last_name,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await profileService.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WEBP image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const data = await profileService.uploadProfilePicture(file);
      setProfile({
        ...profile,
        profile_picture: data.profile_picture,
      });
      // Update user context
      if (user) {
        updateUser({ profile_picture: data.profile_picture });
      }
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      await profileService.deleteProfilePicture();
      setProfile({
        ...profile,
        profile_picture: '',
      });
      if (user) {
        updateUser({ profile_picture: '' });
      }
      toast.success('Profile picture removed');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove picture');
    }
  };

  const getProfilePictureUrl = (): string | undefined => {
    if (profile.profile_picture) {
      return `http://127.0.0.1:5000${profile.profile_picture}`;
    }
    return undefined;
  };

  if (profileLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-primary-100">Manage your personal information</p>
            </div>
            {!isEditing && !isChangingPassword && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors inline-flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {getProfilePictureUrl() ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-primary-100">
                  <UserCircleIcon className="h-16 w-16 text-primary-600" />
                </div>
              )}
              
              {/* Upload Button Overlay */}
              <div className="absolute bottom-0 right-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
                >
                  <CameraIcon className="h-4 w-4" />
                </label>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.first_name || user?.first_name} {profile.last_name || user?.last_name}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user?.role === 'organizer' ? 'bg-blue-100 text-blue-700' :
                  user?.role === 'vendor' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user?.role?.toUpperCase() || 'ATTENDEE'}
                </span>
                {profile.profile_picture && (
                  <button
                    onClick={handleDeletePicture}
                    className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                  >
                    <TrashIcon className="h-3 w-3" />
                    Remove
                  </button>
                )}
                {uploading && (
                  <span className="text-xs text-gray-500">Uploading...</span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6 border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="first_name"
                      type="text"
                      value={profile.first_name}
                      onChange={handleChange}
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Last Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="last_name"
                      type="text"
                      value={profile.last_name}
                      onChange={handleChange}
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="input-label">Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="phone_number"
                    type="tel"
                    value={profile.phone_number || ''}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="0712345678"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfile({
                      ...profile,
                      first_name: user?.first_name || '',
                      last_name: user?.last_name || '',
                    });
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Password Change */}
          {!isEditing && !isChangingPassword && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-2"
              >
                <KeyIcon className="h-4 w-4" />
                Change Password
              </button>
            </div>
          )}

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="border-t border-gray-200 pt-6 mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              
              <div>
                <label className="input-label">Current Password</label>
                <input
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="input-field"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="input-label">New Password</label>
                <input
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  className="input-field"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="input-label">Confirm New Password</label>
                <input
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  className="input-field"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      confirm_password: '',
                    });
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
