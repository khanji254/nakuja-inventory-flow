import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryItem } from '@/types';
import { localStorageService } from '@/lib/storage-service';

// Mock data for development
const mockInventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Carbon Fiber Sheets',
    category: 'Materials',
    vendor: 'Aerospace Supplies Co.',
    unitPrice: 150.00,
    currentStock: 5,
    quantity: 5,
    reorderPoint: 10,
    minStock: 10,
    description: 'High-quality carbon fiber sheets for rocket body construction',
    lastUpdated: new Date(),
    updatedBy: 'John Doe',
    priority: 'urgent',
    eisenhowerQuadrant: 'important-urgent'
  },
  {
    id: '2',
    name: 'Altimeter Sensors',
    category: 'Electronics',
    vendor: 'Flight Electronics Inc.',
    unitPrice: 75.00,
    currentStock: 15,
    quantity: 15,
    reorderPoint: 5,
    minStock: 5,
    description: 'Precision altimeter sensors for flight data collection',
    lastUpdated: new Date(),
    updatedBy: 'Jane Smith',
    priority: 'important',
    eisenhowerQuadrant: 'important-not-urgent'
  },
  {
    id: '3',
    name: 'Parachute Cord',
    category: 'Recovery',
    vendor: 'Parachute Systems LLC',
    unitPrice: 25.00,
    currentStock: 100,
    quantity: 100,
    reorderPoint: 50,
    minStock: 50,
    description: 'Military-grade parachute cord for recovery systems',
    lastUpdated: new Date(),
    updatedBy: 'Mike Johnson',
    priority: 'normal',
    eisenhowerQuadrant: 'not-important-not-urgent'
  },
  {
    id: '4',
    name: 'Telemetry Transmitters',
    category: 'Electronics',
    vendor: 'Radio Systems Co.',
    unitPrice: 200.00,
    currentStock: 8,
    quantity: 8,
    reorderPoint: 3,
    minStock: 3,
    description: 'High-frequency telemetry transmitters for real-time data',
    lastUpdated: new Date(),
    updatedBy: 'Sarah Wilson',
    priority: 'important',
    eisenhowerQuadrant: 'important-not-urgent'
  },
];

// Simulate API calls with localStorage persistence
const inventoryAPI = {
  getInventory: async (): Promise<InventoryItem[]> => {
    // Try to get from localStorage first
    const stored = localStorageService.getItem<InventoryItem[]>('inventory');
    if (stored) {
      return stored.map(item => ({
        ...item,
        lastUpdated: new Date(item.lastUpdated)
      }));
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Save mock data to localStorage and return
    localStorageService.setItem('inventory', mockInventoryData);
    return mockInventoryData;
  },

  addItem: async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem> => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date(),
    };
    
    // Get current data
    const current = localStorageService.getItem<InventoryItem[]>('inventory') || [];
    const updated = [...current, newItem];
    
    // Save to localStorage
    localStorageService.setItem('inventory', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return newItem;
  },

  updateItem: async (item: InventoryItem): Promise<InventoryItem> => {
    const updatedItem = {
      ...item,
      lastUpdated: new Date(),
    };
    
    // Get current data and update
    const current = localStorageService.getItem<InventoryItem[]>('inventory') || [];
    const updated = current.map(i => i.id === item.id ? updatedItem : i);
    
    // Save to localStorage
    localStorageService.setItem('inventory', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return updatedItem;
  },

  deleteItem: async (id: string): Promise<void> => {
    // Get current data and filter out deleted item
    const current = localStorageService.getItem<InventoryItem[]>('inventory') || [];
    const updated = current.filter(item => item.id !== id);
    
    // Save to localStorage
    localStorageService.setItem('inventory', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  bulkImport: async (items: InventoryItem[]): Promise<void> => {
    // Get current data
    const current = localStorageService.getItem<InventoryItem[]>('inventory') || [];
    
    // Add new items with proper timestamps
    const newItems = items.map(item => ({
      ...item,
      id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date()
    }));
    
    const updated = [...current, ...newItems];
    
    // Save to localStorage
    localStorageService.setItem('inventory', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
  }
};

export const useInventoryData = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryAPI.getInventory,
  });
};

export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryAPI.addItem,
    onSuccess: (newItem) => {
      queryClient.setQueryData(['inventory'], (oldData: InventoryItem[] | undefined) => {
        return oldData ? [...oldData, newItem] : [newItem];
      });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryAPI.updateItem,
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(['inventory'], (oldData: InventoryItem[] | undefined) => {
        return oldData ? oldData.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ) : [updatedItem];
      });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryAPI.deleteItem,
    onSuccess: (_, deletedItemId) => {
      queryClient.setQueryData(['inventory'], (oldData: InventoryItem[] | undefined) => {
        return oldData ? oldData.filter(item => item.id !== deletedItemId) : [];
      });
    },
  });
};

export const useBulkImportInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryAPI.bulkImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};