import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const TranslationDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('common.welcome')}</h1>
        <LanguageSwitcher />
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('common.events')}</h2>
        <p className="text-gray-600">{t('events.create_new_event')}</p>
        <p className="text-gray-600">{t('events.event_details')}</p>
        <div className="mt-4 flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{t('events.published')}</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{t('events.featured')}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('auth.sign_in')}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('auth.email')}</label>
            <input type="email" className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
          <button className="btn-primary w-full">{t('auth.sign_in')}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('common.bookings')}</h2>
        <div className="flex justify-between items-center border-b border-gray-100 py-2">
          <span>{t('bookings.reference')}: BK12345678</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">{t('bookings.confirmed')}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-100 py-2">
          <span>{t('bookings.tickets')}: 2</span>
          <span>{t('bookings.total')}: KES 100.00</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('common.profile')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('profile.full_name')}</p>
            <p className="font-medium">John Doe</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('profile.email_address')}</p>
            <p className="font-medium">john@example.com</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('profile.role')}</p>
            <p className="font-medium">Admin</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('profile.member_since')}</p>
            <p className="font-medium">Jan 2026</p>
          </div>
        </div>
        <button className="btn-primary mt-4 w-full">{t('profile.update_profile')}</button>
      </div>
    </div>
  );
};

export default TranslationDemo;
