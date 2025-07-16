import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillOfMaterials, BOMItem } from '@/types';

// Mock data for development
const mockBOMData: BillOfMaterials[] = [
  {
    id: '1',
    name: 'Avionics System v3.0',
    team: 'Avionics',
    items: [
      {
        id: '1',
        itemName: 'Flight Computer',
        quantity: 1,
        unitPrice: 450.00,
        totalPrice: 450.00,
        vendor: 'Aerospace Electronics',
        inventoryItemId: '4',
        availableStock: 8,
        shortfall: 0,
        notes: 'Main flight computer for navigation and control'
      },
      {
        id: '2',
        itemName: 'Altimeter Sensor',
        quantity: 2,
        unitPrice: 75.00,
        totalPrice: 150.00,
        vendor: 'Flight Electronics Inc.',
        inventoryItemId: '2',
        availableStock: 15,
        shortfall: 0,
        notes: 'Dual altimeter setup for redundancy'
      },
      {
        id: '3',
        itemName: 'GPS Module',
        quantity: 1,
        unitPrice: 120.00,
        totalPrice: 120.00,
        vendor: 'Navigation Systems',
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
    name: 'Parachute Recovery System v2.1',
    team: 'Parachute',
    items: [
      {
        id: '4',
        itemName: 'Main Parachute',
        quantity: 1,
        unitPrice: 350.00,
        totalPrice: 350.00,
        vendor: 'Parachute Systems LLC',
        availableStock: 3,
        shortfall: 0,
        notes: 'Primary recovery parachute'
      },
      {
        id: '5',
        itemName: 'Drogue Parachute',
        quantity: 1,
        unitPrice: 180.00,
        totalPrice: 180.00,
        vendor: 'Parachute Systems LLC',
        availableStock: 5,
        shortfall: 0,
        notes: 'Drogue chute for initial deceleration'
      },
      {
        id: '6',
        itemName: 'Deployment Bag',
        quantity: 2,
        unitPrice: 80.00,
        totalPrice: 160.00,
        vendor: 'Recovery Systems Inc.',
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
    name: 'Telemetry System v1.5',
    team: 'Telemetry',
    items: [
      {
        id: '7',
        itemName: 'Radio Transmitter',
        quantity: 1,
        unitPrice: 275.00,
        totalPrice: 275.00,
        vendor: 'RF Solutions Co.',
        availableStock: 2,
        shortfall: 0,
        notes: 'Primary telemetry transmitter'
      },
      {
        id: '8',
        itemName: 'Antenna',
        quantity: 2,
        unitPrice: 45.00,
        totalPrice: 90.00,
        vendor: 'Antenna Systems Inc.',
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

export const useBOMData = () => {
  return useQuery({
    queryKey: ['bom'],
    queryFn: async (): Promise<BillOfMaterials[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockBOMData;
    },
  });
};

export const useAddBOM = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bom: Omit<BillOfMaterials, 'id' | 'createdDate' | 'lastUpdated'>): Promise<BillOfMaterials> => {
      const newBOM: BillOfMaterials = {
        ...bom,
        id: Date.now().toString(),
        createdDate: new Date(),
        lastUpdated: new Date(),
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return newBOM;
    },
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
    mutationFn: async (bom: BillOfMaterials): Promise<BillOfMaterials> => {
      const updatedBOM = {
        ...bom,
        lastUpdated: new Date(),
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return updatedBOM;
    },
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
    mutationFn: async (bomId: string): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onSuccess: (_, deletedBOMId) => {
      queryClient.setQueryData(['bom'], (oldData: BillOfMaterials[] | undefined) => {
        return oldData ? oldData.filter(bom => bom.id !== deletedBOMId) : [];
      });
    },
  });
};