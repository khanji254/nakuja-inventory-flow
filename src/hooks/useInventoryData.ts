import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryItem } from '@/types';

// Mock data for development
const mockInventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Carbon Fiber Sheets',
    category: 'Materials',
    vendor: 'Aerospace Supplies Co.',
    unitPrice: 150.00,
    currentStock: 5,
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
    minStock: 3,
    description: 'High-frequency telemetry transmitters for real-time data',
    lastUpdated: new Date(),
    updatedBy: 'Sarah Wilson',
    priority: 'important',
    eisenhowerQuadrant: 'important-not-urgent'
  },
];

export const useInventoryData = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async (): Promise<InventoryItem[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInventoryData;
    },
  });
};

export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem> => {
      const newItem: InventoryItem = {
        ...item,
        id: Date.now().toString(),
        lastUpdated: new Date(),
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return newItem;
    },
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
    mutationFn: async (item: InventoryItem): Promise<InventoryItem> => {
      const updatedItem = {
        ...item,
        lastUpdated: new Date(),
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return updatedItem;
    },
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
    mutationFn: async (itemId: string): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onSuccess: (_, deletedItemId) => {
      queryClient.setQueryData(['inventory'], (oldData: InventoryItem[] | undefined) => {
        return oldData ? oldData.filter(item => item.id !== deletedItemId) : [];
      });
    },
  });
};