import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BackButton from '../../components/admin/BackButton';
import { toast } from 'react-hot-toast';
import { 
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface SettingsState {
  notifications: boolean;
  emailNotifications: boolean;
  language: string;
  theme: string;
  twoFactorAuth: boolean;
}

interface SettingsField {
  key: string;
  label: string;
  type: string;
  value: string | boolean;
  options?: { value: string; label: string }[];
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    emailNotifications: true,
    language: 'en',
    theme: 'light',
    twoFactorAuth: false,
  });

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated successfully');
  };

  const handleSelectChange = (key: keyof SettingsState, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting updated successfully');
  };

  const settingsSections = [
    {
      title: 'General Settings',
      icon: GlobeAltIcon,
      fields: [
        { 
          key: 'language', 
          label: 'Default Language', 
          type: 'select', 
          value: settings.language, 
          options: [
            { value: 'en', label: 'English' },
            { value: 'sw', label: 'Kiswahili' },
            { value: 'fr', label: 'Français' },
          ]
        },
        { 
          key: 'theme', 
          label: 'Theme', 
          type: 'select', 
          value: settings.theme, 
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]
        },
      ]
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      fields: [
        { key: 'notifications', label: 'Push Notifications', type: 'toggle', value: settings.notifications },
        { key: 'emailNotifications', label: 'Email Notifications', type: 'toggle', value: settings.emailNotifications },
      ]
    },
    {
      title: 'Security',
      icon: ShieldCheckIcon,
      fields: [
        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', type: 'toggle', value: settings.twoFactorAuth },
      ]
    },
  ];

  return (
    <AdminLayout>
      <BackButton />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your application settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-soft p-4 sticky top-24">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Settings</h3>
            <div className="space-y-1">
              {settingsSections.map((section, idx) => (
                <a
                  key={idx}
                  href={`#section-${idx}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <section.icon className="h-5 w-5 text-gray-400" />
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {settingsSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} id={`section-${idx}`} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-500">Configure your {section.title.toLowerCase()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {section.fields.map((field: SettingsField, fIdx: number) => (
                    <div key={fIdx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{field.label}</p>
                        <p className="text-xs text-gray-500">Update your {field.label.toLowerCase()}</p>
                      </div>
                      <div>
                        {field.type === 'toggle' ? (
                          <button
                            onClick={() => handleToggle(field.key as keyof SettingsState)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              field.value ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                          >
                            <div 
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                field.value ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        ) : field.type === 'select' && field.options ? (
                          <select
                            value={field.value as string}
                            onChange={(e) => handleSelectChange(field.key as keyof SettingsState, e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {field.options.map((opt: { value: string; label: string }) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
