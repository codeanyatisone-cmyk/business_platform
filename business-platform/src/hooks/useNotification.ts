import { useState, useCallback } from 'react';
import { NotificationProps } from '../types';

interface Notification extends NotificationProps {
  id: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: NotificationProps) => {
    const id = Date.now();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 3000,
    };

    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, newNotification.duration);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
  };
}








