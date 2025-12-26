import React, { useEffect, useState } from 'react';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-800',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    info: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-800',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-800',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  };

  const style = typeStyles[notification.type] || typeStyles.info;

  return (
    <div className={`fixed top-6 right-6 z-[100] transition-all duration-500 ease-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className={`${style.bg} ${style.border} border-2 rounded-2xl p-4 shadow-2xl shadow-gray-200 min-w-[320px] flex items-center gap-4`}>
        <div className={`${style.iconBg} ${style.iconColor} w-10 h-10 rounded-xl flex items-center justify-center`}>
          {style.icon}
        </div>
        <div className="flex-1">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5 ${style.text}`}>
            {notification.type}
          </p>
          <p className={`text-sm font-bold leading-tight ${style.text}`}>
            {notification.message}
          </p>
        </div>
        <button 
          onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
