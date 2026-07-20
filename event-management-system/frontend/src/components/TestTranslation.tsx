import React from 'react';
import { useTranslation } from 'react-i18next';

const TestTranslation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white rounded-xl shadow-soft">
      <h1 className="text-2xl font-bold text-gray-900">{t('common.welcome')}</h1>
      <p className="text-gray-600">{t('events.create')}</p>
      <button className="btn-primary mt-4">{t('auth.sign_in')}</button>
    </div>
  );
};

export default TestTranslation;
