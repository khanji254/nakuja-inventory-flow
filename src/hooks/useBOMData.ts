import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillOfMaterials, BOMItem } from '@/types';
import { localStorageService } from '@/lib/storage-service';

// Mock data for development
const mockBOMData: BillOfMaterials[] = [
  {
    id: '1',
    itemName: 'Avionics System v3.0',
    name: 'Avionics System v3.0',
    requiredQuantity: 1,
    unitPrice: 720.00,
    vendor: 'Multiple Vendors',
    team: 'Avionics',
    items: [
      {
        id: '1',
        itemName: 'Flight Computer',
        requiredQuantity: 1,
        quantity: 1,
        unitPrice: 450.00,
        totalPrice: 450.00,
        vendor: 'Aerospace Electronics',
        team: 'Avionics',
        inventoryItemId: '4',
        availableStock: 8,
        shortfall: 0,
        notes: 'Main flight computer for navigation and control'
      },
      {
        id: '2',
        itemName: 'Altimeter Sensor',
        requiredQuantity: 2,
        quantity: 2,
        unitPrice: 75.00,
        totalPrice: 150.00,
        vendor: 'Flight Electronics Inc.',
        team: 'Avionics',
        inventoryItemId: '2',
        availableStock: 15,
        shortfall: 0,
        notes: 'Dual altimeter setup for redundancy'
      },
      {
        id: '3',
        itemName: 'GPS Module',
        requiredQuantity: 1,
        quantity: 1,
        unitPrice: 120.00,
        totalPrice: 120.00,
        vendor: 'Navigation Systems',
        team: 'Avionics',
        inventoryItemId: '3',
        availableStock: 0,
        shortfall: 1,
        notes: 'High-precision GPS for location tracking'
      }
    ],
    totalCost: 720.00,
    createdBy: 'Sarah Wilson',
    createdDate: new Date('2024-01-10'),
    lastUpdated: new Date('2024-01-15'),
    status: 'active'
  },
  {
    id: '2',
    itemName: 'Parachute Recovery System v2.1',
    name: 'Parachute Recovery System v2.1',
    requiredQuantity: 1,
    unitPrice: 690.00,
    vendor: 'Multiple Vendors',
    team: 'Parachute',
    items: [
      {
        id: '4',
        itemName: 'Main Parachute',
        requiredQuantity: 1,
        quantity: 1,
        unitPrice: 350.00,
        totalPrice: 350.00,
        vendor: 'Parachute Systems LLC',
        team: 'Parachute',
        availableStock: 3,
        shortfall: 0,
        notes: 'Primary recovery parachute'
      },
      {
        id: '5',
        itemName: 'Drogue Parachute',
        requiredQuantity: 1,
        quantity: 1,
        unitPrice: 180.00,
        totalPrice: 180.00,
        vendor: 'Parachute Systems LLC',
        team: 'Parachute',
        availableStock: 5,
        shortfall: 0,
        notes: 'Drogue chute for initial deceleration'
      },
      {
        id: '6',
        itemName: 'Deployment Bag',
        requiredQuantity: 2,
        quantity: 2,
        unitPrice: 80.00,
        totalPrice: 160.00,
        vendor: 'Recovery Systems Inc.',
        team: 'Parachute',
        availableStock: 4,
        shortfall: 0,
        notes: 'Parachute deployment bags'
      }
    ],
    totalCost: 690.00,
    createdBy: 'Mike Johnson',
    createdDate: new Date('2024-01-08'),
    lastUpdated: new Date('2024-01-12'),
    status: 'active'
  },
  {
    id: '3',
    itemName: 'Telemetry System v1.5',
    name: 'Telemetry System v1.5',
    requiredQuantity: 1,
    unitPrice: 365.00,
    vendor: 'Multiple Vendors',
    team: 'Telemetry',
    items: [
      {
        id: '7',
        itemName: 'Radio Transmitter',
        requiredQuantity: 1,
        quantity: 1,
        unitPrice: 275.00,
        totalPrice: 275.00,
        vendor: 'RF Solutions Co.',
        team: 'Telemetry',
        availableStock: 2,
        shortfall: 0,
        notes: 'Primary telemetry transmitter'
      },
      {
        id: '8',
        itemName: 'Antenna',
        requiredQuantity: 2,
        quantity: 2,
        unitPrice: 45.00,
        totalPrice: 90.00,
        vendor: 'Antenna Systems Inc.',
        team: 'Telemetry',
        availableStock: 10,
        shortfall: 0,
        notes: 'Dual antenna setup for better coverage'
      }
    ],
    totalCost: 365.00,
    createdBy: 'David Brown',
    createdDate: new Date('2024-01-05'),
    lastUpdated: new Date('2024-01-10'),
    status: 'draft'
  }
];

// Simulate API calls with localStorage persistence
const bomAPI = {
  getBOMs: async (): Promise<BillOfMaterials[]> => {
    // Try to get from localStorage first
    const stored = localStorageService.getItem<BillOfMaterials[]>('bom');
    if (stored) {
      return stored.map(bom => ({
        ...bom,
        createdDate: new Date(bom.createdDate),
        lastUpdated: new Date(bom.lastUpdated)
      }));
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Save mock data to localStorage and return
    localStorageService.setItem('bom', mockBOMData);
    return mockBOMData;
  },

  addBOM: async (bom: Omit<BillOfMaterials, 'id' | 'createdDate' | 'lastUpdated'>): Promise<BillOfMaterials> => {
    const newBOM: BillOfMaterials = {
      ...bom,
      id: Date.now().toString(),
      createdDate: new Date(),
      lastUpdated: new Date(),
    };
    
    // Get current data
    const current = localStorageService.getItem<BillOfMaterials[]>('bom') || [];
    const updated = [...current, newBOM];
    
    // Save to localStorage
    localStorageService.setItem('bom', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return newBOM;
  },

  updateBOM: async (bom: BillOfMaterials): Promise<BillOfMaterials> => {
    const updatedBOM = {
      ...bom,
      lastUpdated: new Date(),
    };
    
    // Get current data and update
    const current = localStorageService.getItem<BillOfMaterials[]>('bom') || [];
    const updated = current.map(b => b.id === bom.id ? updatedBOM : b);
    
    // Save to localStorage
    localStorageService.setItem('bom', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return updatedBOM;
  },

  deleteBOM: async (bomId: string): Promise<void> => {
    // Get current data and filter out deleted BOM
    const current = localStorageService.getItem<BillOfMaterials[]>('bom') || [];
    const updated = current.filter(bom => bom.id !== bomId);
    
    // Save to localStorage
    localStorageService.setItem('bom', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

export const useBOMData = () => {
  return useQuery({
    queryKey: ['bom'],
    queryFn: bomAPI.getBOMs,
  });
};

export const useAddBOM = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bomAPI.addBOM,
    onSuccess: (newBOM) => {
      queryClient.setQueryData(['bom'], (oldData: BillOfMaterials[] | undefined) => {
        return oldData ? [...oldData, newBOM] : [newBOM];
      });
    },
  });
};

export const useUpdateBOM = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bomAPI.updateBOM,
    onSuccess: (updatedBOM) => {
      queryClient.setQueryData(['bom'], (oldData: BillOfMaterials[] | undefined) => {
        return oldData ? oldData.map(bom => 
          bom.id === updatedBOM.id ? updatedBOM : bom
        ) : [updatedBOM];
      });
    },
  });
};

export const useDeleteBOM = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bomAPI.deleteBOM,
    onSuccess: (_, deletedBOMId) => {
      queryClient.setQueryData(['bom'], (oldData: BillOfMaterials[] | undefined) => {
        return oldData ? oldData.filter(bom => bom.id !== deletedBOMId) : [];
      });
    },
  });
};