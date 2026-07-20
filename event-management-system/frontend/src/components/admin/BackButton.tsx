import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  label = 'Go Back', 
  fallbackPath = '/admin' 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-4 group"
    >
      <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
