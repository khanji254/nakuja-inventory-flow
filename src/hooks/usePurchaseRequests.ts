import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseRequest, PurchaseList, PurchaseListItem } from '@/types';
import { localStorageService } from '@/lib/storage-service';

// Mock data for development
const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: '1',
    itemName: 'Flight Computer Module',
    unitPrice: 450.00,
    quantity: 2,
    urgency: 'high',
    vendor: 'aerospace-electronics-1',
    requestedBy: 'Sarah Wilson',
    requestedDate: new Date('2024-01-15'),
    status: 'pending',
    notes: 'Needed for upcoming test flight',
    team: 'Avionics',
    eisenhowerQuadrant: 'important-urgent',
    isLowStockItem: false
  },
  {
    id: '2',
    itemName: 'Deployment Bag',
    unitPrice: 80.00,
    quantity: 5,
    urgency: 'medium',
    vendor: 'recovery-systems-1',
    requestedBy: 'Mike Johnson',
    requestedDate: new Date('2024-01-14'),
    status: 'approved',
    approvedBy: 'John Doe',
    approvedDate: new Date('2024-01-16'),
    notes: 'Backup deployment bags for recovery system',
    team: 'Parachute',
    eisenhowerQuadrant: 'important-not-urgent',
    isLowStockItem: true
  },
  {
    id: '3',
    itemName: 'Radio Frequency Amplifier',
    unitPrice: 275.00,
    quantity: 1,
    urgency: 'critical',
    vendor: 'rf-solutions-1',
    requestedBy: 'David Brown',
    requestedDate: new Date('2024-01-13'),
    status: 'completed',
    approvedBy: 'John Doe',
    approvedDate: new Date('2024-01-14'),
    notes: 'Critical for telemetry system upgrade',
    team: 'Telemetry',
    eisenhowerQuadrant: 'important-urgent',
    orderNumber: 'ORD-001',
    deliveryDate: new Date('2024-01-20'),
    isLowStockItem: false
  },
  {
    id: '4',
    itemName: 'Female Header Pins',
    unitPrice: 30.00,
    quantity: 10,
    urgency: 'low',
    vendor: 'pixel-electronics-1',
    requestedBy: 'Alex Chen',
    requestedDate: new Date('2024-01-16'),
    status: 'approved',
    approvedBy: 'Sarah Wilson',
    approvedDate: new Date('2024-01-17'),
    notes: 'For PCB prototyping',
    team: 'Avionics',
    eisenhowerQuadrant: 'not-important-not-urgent',
    isLowStockItem: true,
    listId: 'list-1'
  },
  {
    id: '5',
    itemName: 'Copper Clad Board (15x20cm, Single Side)',
    unitPrice: 200.00,
    quantity: 4,
    urgency: 'medium',
    vendor: 'pixel-electronics-1',
    requestedBy: 'Alex Chen',
    requestedDate: new Date('2024-01-16'),
    status: 'approved',
    approvedBy: 'Sarah Wilson',
    approvedDate: new Date('2024-01-17'),
    notes: 'PCB substrate for custom boards',
    team: 'Avionics',
    eisenhowerQuadrant: 'important-not-urgent',
    isLowStockItem: true,
    listId: 'list-1'
  }
];

const mockPurchaseLists: PurchaseList[] = [
  {
    id: 'list-1',
    title: 'Pixel Electronics Purchase List',
    description: 'Electronics components for Q1 prototyping',
    team: 'Avionics',
    category: 'Electronics',
    color: '#3B82F6',
    vendors: ['pixel-electronics-1'], // Updated to array
    items: [
      {
        id: 'item-1',
        requestId: '4',
        itemName: 'Female Header Pins',
        description: 'For PCB prototyping',
        quantity: 10,
        unitPrice: 30.00,
        totalPrice: 300.00,
        vendor: 'pixel-electronics-1',
        category: 'Electronics',
        location: 'Store A',
        urgency: 'low',
        status: 'pending',
        team: 'Avionics'
      },
      {
        id: 'item-2',
        requestId: '5',
        itemName: 'Copper Clad Board (15x20cm, Single Side)',
        description: 'PCB substrate for custom boards',
        quantity: 4,
        unitPrice: 200.00,
        totalPrice: 800.00,
        vendor: 'pixel-electronics-1',
        category: 'Electronics',
        location: 'Store A',
        urgency: 'medium',
        status: 'pending',
        team: 'Avionics'
      }
    ],
    status: 'approved',
    totalAmount: 1100.00,
    createdBy: 'Alex Chen',
    createdDate: new Date('2024-01-16'),
    submittedDate: new Date('2024-01-16'),
    approvedDate: new Date('2024-01-17'),
    notes: 'Urgent for upcoming prototype development'
  }
];

// Simulate API calls with localStorage persistence
const purchaseRequestsAPI = {
  getRequests: async (): Promise<PurchaseRequest[]> => {
    // Try to get from localStorage first
    const stored = localStorageService.getItem<PurchaseRequest[]>('purchaseRequests');
    if (stored) {
      return stored.map(request => ({
        ...request,
        requestedDate: new Date(request.requestedDate),
        approvedDate: request.approvedDate ? new Date(request.approvedDate) : undefined,
        deliveryDate: request.deliveryDate ? new Date(request.deliveryDate) : undefined
      }));
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Save mock data to localStorage and return
    localStorageService.setItem('purchaseRequests', mockPurchaseRequests);
    return mockPurchaseRequests;
  },

  addRequest: async (request: Omit<PurchaseRequest, 'id' | 'requestedDate'>): Promise<PurchaseRequest> => {
    const newRequest: PurchaseRequest = {
      ...request,
      id: Date.now().toString(),
      requestedDate: new Date(),
    };
    
    // Get current data
    const current = localStorageService.getItem<PurchaseRequest[]>('purchaseRequests') || [];
    const updated = [...current, newRequest];
    
    // Save to localStorage
    localStorageService.setItem('purchaseRequests', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return newRequest;
  },

  updateRequestStatus: async (data: { 
    requestId: string; 
    status: PurchaseRequest['status']; 
    approvedBy?: string; 
    notes?: string;
    orderNumber?: string;
    deliveryDate?: Date;
  }): Promise<PurchaseRequest> => {
    // Get current data
    const current = localStorageService.getItem<PurchaseRequest[]>('purchaseRequests') || [];
    
    // Find and update request
    const updated = current.map(request => {
      if (request.id === data.requestId) {
        const updatedRequest = {
          ...request,
          status: data.status,
          notes: data.notes || request.notes
        };

        if (data.status === 'approved') {
          updatedRequest.approvedBy = data.approvedBy;
          updatedRequest.approvedDate = new Date();
        }

        if (data.orderNumber) {
          updatedRequest.orderNumber = data.orderNumber;
        }

        if (data.deliveryDate) {
          updatedRequest.deliveryDate = data.deliveryDate;
        }

        return updatedRequest;
      }
      return request;
    });
    
    // Save to localStorage
    localStorageService.setItem('purchaseRequests', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedRequest = updated.find(r => r.id === data.requestId);
    if (!updatedRequest) throw new Error('Request not found');
    return updatedRequest;
  },

  bulkImport: async (requests: PurchaseRequest[]): Promise<void> => {
    // Get current data
    const current = localStorageService.getItem<PurchaseRequest[]>('purchaseRequests') || [];
    
    // Add new requests with proper timestamps
    const newRequests = requests.map(request => ({
      ...request,
      id: request.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      requestedDate: new Date()
    }));
    
    const updated = [...current, ...newRequests];
    
    // Save to localStorage
    localStorageService.setItem('purchaseRequests', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Purchase Lists API
const purchaseListsAPI = {
  getLists: async (): Promise<PurchaseList[]> => {
    const stored = localStorageService.getItem<PurchaseList[]>('purchaseLists');
    if (stored) {
      return stored.map(list => ({
        ...list,
        createdDate: new Date(list.createdDate),
        submittedDate: list.submittedDate ? new Date(list.submittedDate) : undefined,
        approvedDate: list.approvedDate ? new Date(list.approvedDate) : undefined,
        orderDate: list.orderDate ? new Date(list.orderDate) : undefined,
        completedDate: list.completedDate ? new Date(list.completedDate) : undefined
      }));
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorageService.setItem('purchaseLists', mockPurchaseLists);
    return mockPurchaseLists;
  },

  createList: async (list: Omit<PurchaseList, 'id' | 'createdDate' | 'totalAmount'>): Promise<PurchaseList> => {
    const newList: PurchaseList = {
      ...list,
      id: Date.now().toString(),
      createdDate: new Date(),
      totalAmount: list.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    };
    
    const current = localStorageService.getItem<PurchaseList[]>('purchaseLists') || [];
    const updated = [...current, newList];
    
    localStorageService.setItem('purchaseLists', updated);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return newList;
  },

  updateList: async (listId: string, updates: Partial<PurchaseList>): Promise<PurchaseList> => {
    const current = localStorageService.getItem<PurchaseList[]>('purchaseLists') || [];
    
    const updated = current.map(list => {
      if (list.id === listId) {
        const updatedList = { ...list, ...updates };
        updatedList.totalAmount = updatedList.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        return updatedList;
      }
      return list;
    });
    
    localStorageService.setItem('purchaseLists', updated);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedList = updated.find(l => l.id === listId);
    if (!updatedList) throw new Error('List not found');
    return updatedList;
  },

  addItemToList: async (listId: string, item: Omit<PurchaseListItem, 'id'>): Promise<PurchaseList> => {
    const current = localStorageService.getItem<PurchaseList[]>('purchaseLists') || [];
    
    const updated = current.map(list => {
      if (list.id === listId) {
        const newItem: PurchaseListItem = {
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          totalPrice: item.unitPrice * item.quantity
        };
        
        const updatedList = {
          ...list,
          items: [...list.items, newItem],
          vendors: list.vendors.includes(item.vendor) ? list.vendors : [...list.vendors, item.vendor]
        };
        
        updatedList.totalAmount = updatedList.items.reduce((sum, item) => sum + item.totalPrice, 0);
        return updatedList;
      }
      return list;
    });
    
    localStorageService.setItem('purchaseLists', updated);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedList = updated.find(l => l.id === listId);
    if (!updatedList) throw new Error('List not found');
    return updatedList;
  },

  updateListItem: async (listId: string, itemId: string, updates: Partial<PurchaseListItem>): Promise<PurchaseList> => {
    const current = localStorageService.getItem<PurchaseList[]>('purchaseLists') || [];
    
    const updated = current.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.map(item => {
          if (item.id === itemId) {
            const updatedItem = { ...item, ...updates };
            updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity;
            return updatedItem;
          }
          return item;
        });
        
        const updatedList = { ...list, items: updatedItems };
        
        // Update vendors list if vendor changed
        const allVendors = [...new Set(updatedItems.map(item => item.vendor))];
        updatedList.vendors = allVendors;
        updatedList.totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        return updatedList;
      }
      return list;
    });
    
    localStorageService.setItem('purchaseLists', updated);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedList = updated.find(l => l.id === listId);
    if (!updatedList) throw new Error('List not found');
    return updatedList;
  },

  removeItemFromList: async (listId: string, itemId: string): Promise<PurchaseList> => {
    const current = localStorageService.getItem<PurchaseList[]>('purchaseLists') || [];
    
    const updated = current.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.filter(item => item.id !== itemId);
        const updatedList = { ...list, items: updatedItems };
        
        // Update vendors list
        const allVendors = [...new Set(updatedItems.map(item => item.vendor))];
        updatedList.vendors = allVendors;
        updatedList.totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        return updatedList;
      }
      return list;
    });
    
    localStorageService.setItem('purchaseLists', updated);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedList = updated.find(l => l.id === listId);
    if (!updatedList) throw new Error('List not found');
    return updatedList;
  }
};

// React Query Hooks
export const usePurchaseRequests = () => {
  return useQuery({
    queryKey: ['purchase-requests'],
    queryFn: purchaseRequestsAPI.getRequests,
  });
};

export const usePurchaseLists = () => {
  return useQuery({
    queryKey: ['purchase-lists'],
    queryFn: purchaseListsAPI.getLists,
  });
};

export const useAddPurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: purchaseRequestsAPI.addRequest,
    onSuccess: (newRequest) => {
      queryClient.setQueryData(['purchase-requests'], (oldData: PurchaseRequest[] | undefined) => {
        return oldData ? [...oldData, newRequest] : [newRequest];
      });
    },
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: purchaseRequestsAPI.updateRequestStatus,
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(['purchase-requests'], (oldData: PurchaseRequest[] | undefined) => {
        return oldData ? oldData.map((request: PurchaseRequest) => 
          request.id === updatedRequest.id ? updatedRequest : request
        ) : [updatedRequest];
      });
    },
  });
};

export const useCreatePurchaseList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: purchaseListsAPI.createList,
    onSuccess: (newList) => {
      queryClient.setQueryData(['purchase-lists'], (oldData: PurchaseList[] | undefined) => {
        return oldData ? [...oldData, newList] : [newList];
      });
    },
  });
};

export const useUpdatePurchaseList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, updates }: { listId: string; updates: Partial<PurchaseList> }) => 
      purchaseListsAPI.updateList(listId, updates),
    onSuccess: (updatedList) => {
      queryClient.setQueryData(['purchase-lists'], (oldData: PurchaseList[] | undefined) => {
        return oldData ? oldData.map((list: PurchaseList) => 
          list.id === updatedList.id ? updatedList : list
        ) : [updatedList];
      });
    },
  });
};

export const useBulkImportPurchaseRequests = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: purchaseRequestsAPI.bulkImport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
    },
  });
};

// Purchase List Item Management Hooks
export const useAddItemToList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, item }: { listId: string; item: Omit<PurchaseListItem, 'id'> }) =>
      purchaseListsAPI.addItemToList(listId, item),
    onSuccess: (updatedList) => {
      queryClient.setQueryData(['purchase-lists'], (oldData: PurchaseList[] | undefined) => {
        return oldData ? oldData.map((list: PurchaseList) => 
          list.id === updatedList.id ? updatedList : list
        ) : [updatedList];
      });
    },
  });
};

export const useUpdateListItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemId, updates }: { 
      listId: string; 
      itemId: string; 
      updates: Partial<PurchaseListItem> 
    }) => purchaseListsAPI.updateListItem(listId, itemId, updates),
    onSuccess: (updatedList) => {
      queryClient.setQueryData(['purchase-lists'], (oldData: PurchaseList[] | undefined) => {
        return oldData ? oldData.map((list: PurchaseList) => 
          list.id === updatedList.id ? updatedList : list
        ) : [updatedList];
      });
    },
  });
};

export const useRemoveItemFromList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      purchaseListsAPI.removeItemFromList(listId, itemId),
    onSuccess: (updatedList) => {
      queryClient.setQueryData(['purchase-lists'], (oldData: PurchaseList[] | undefined) => {
        return oldData ? oldData.map((list: PurchaseList) => 
          list.id === updatedList.id ? updatedList : list
        ) : [updatedList];
      });
    },
  });
};

// Helper functions for low stock integration
export const useLowStockItems = () => {
  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => {
      const stored = localStorageService.getItem('inventoryItems');
      if (Array.isArray(stored)) {
        return stored.filter((item: any) => item.currentStock <= (item.reorderPoint || item.minStock || 10));
      }
      return [];
    },
  });
  
  return inventoryItems || [];
};