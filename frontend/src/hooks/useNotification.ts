import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

let notificationCallbacks: Array<(notification: Notification) => void> = [];

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    };

    // Add to local state
    setNotifications(prev => [...prev, notification]);

    // Notify all registered callbacks
    notificationCallbacks.forEach(callback => callback(notification));

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);

    return notification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const registerCallback = useCallback((callback: (notification: Notification) => void) => {
    notificationCallbacks.push(callback);
    
    return () => {
      notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
    };
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    registerCallback
  };
};