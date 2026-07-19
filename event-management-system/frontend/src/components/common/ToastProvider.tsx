import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
          maxWidth: '500px',
        },
        success: {
          duration: 3000,
          style: {
            background: '#22c55e',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ef4444',
          },
        },
        loading: {
          style: {
            background: '#3b82f6',
          },
        },
      }}
    />
  );
};

export default ToastProvider;
