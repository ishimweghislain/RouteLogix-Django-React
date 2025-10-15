import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useNotification, NotificationType } from '../hooks/useNotification';

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification, registerCallback } = useNotification();
  const [allNotifications, setAllNotifications] = React.useState(notifications);

  useEffect(() => {
    // Register for global notifications
    const unregister = registerCallback((notification) => {
      setAllNotifications(prev => [...prev, notification]);
    });

    return unregister;
  }, [registerCallback]);

  useEffect(() => {
    setAllNotifications(notifications);
  }, [notifications]);

  const getIcon = (type: NotificationType) => {
    const iconClasses = "h-6 w-6";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClasses} text-green-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClasses} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClasses} text-yellow-500`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClasses} text-blue-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClasses} text-blue-500`} />;
    }
  };

  const getColors = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      <AnimatePresence>
        {allNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
            className={`
              max-w-sm w-full border rounded-lg shadow-lg p-4 
              ${getColors(notification.type)}
              backdrop-blur-sm
            `}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;