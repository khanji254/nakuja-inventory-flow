import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types';
import { localStorageService } from '@/lib/storage-service';

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Low Stock Alert',
    message: 'Carbon Fiber Sheets are running low (5 units remaining)',
    type: 'warning',
    priority: 'high',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    relatedItemId: '1',
    relatedItemType: 'inventory',
    actionUrl: '/inventory'
  },
  {
    id: '2',
    title: 'Purchase Request Approved',
    message: 'Flight Computer Module purchase request has been approved',
    type: 'success',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    relatedItemId: '1',
    relatedItemType: 'purchase-request',
    actionUrl: '/purchase-requests'
  },
  {
    id: '3',
    title: 'Critical Item Shortage',
    message: 'GPS Module is out of stock and required for Avionics System v3.0',
    type: 'error',
    priority: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    relatedItemId: '1',
    relatedItemType: 'bom',
    actionUrl: '/bom'
  },
  {
    id: '4',
    title: 'BOM Updated',
    message: 'Parachute Recovery System v2.1 BOM has been updated',
    type: 'info',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    relatedItemId: '2',
    relatedItemType: 'bom',
    actionUrl: '/bom'
  },
  {
    id: '5',
    title: 'New Purchase Request',
    message: 'Radio Frequency Amplifier purchase request submitted by David Brown',
    type: 'info',
    priority: 'medium',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    relatedItemId: '3',
    relatedItemType: 'purchase-request',
    actionUrl: '/purchase-requests'
  }
];

// Simulate API calls with localStorage persistence
const notificationsAPI = {
  getNotifications: async (): Promise<Notification[]> => {
    // Try to get from localStorage first
    const stored = localStorageService.getItem<Notification[]>('notifications');
    if (stored) {
      return stored.map(notification => ({
        ...notification,
        createdAt: new Date(notification.createdAt)
      }));
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Save mock data to localStorage and return
    localStorageService.setItem('notifications', mockNotifications);
    return mockNotifications;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    // Get current data
    const current = localStorageService.getItem<Notification[]>('notifications') || [];
    
    // Update notification
    const updated = current.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    
    // Save to localStorage
    localStorageService.setItem('notifications', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
  },

  markAllAsRead: async (): Promise<void> => {
    // Get current data
    const current = localStorageService.getItem<Notification[]>('notifications') || [];
    
    // Mark all as read
    const updated = current.map(notification => ({ ...notification, read: true }));
    
    // Save to localStorage
    localStorageService.setItem('notifications', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    // Get current data
    const current = localStorageService.getItem<Notification[]>('notifications') || [];
    
    // Filter out deleted notification
    const updated = current.filter(notification => notification.id !== notificationId);
    
    // Save to localStorage
    localStorageService.setItem('notifications', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsAPI.getNotifications,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Helper function to get unread notification count
export const useUnreadNotificationCount = () => {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter(n => !n.read).length;
};
