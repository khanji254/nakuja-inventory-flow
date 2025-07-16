import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseRequest } from '@/types';

// Mock data for development
const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: '1',
    itemName: 'Flight Computer Module',
    unitPrice: 450.00,
    quantity: 2,
    urgency: 'high',
    vendor: 'Aerospace Electronics',
    requestedBy: 'Sarah Wilson',
    requestedDate: new Date('2024-01-15'),
    status: 'pending',
    notes: 'Needed for upcoming test flight',
    team: 'Avionics',
    eisenhowerQuadrant: 'important-urgent'
  },
  {
    id: '2',
    itemName: 'Deployment Bag',
    unitPrice: 80.00,
    quantity: 5,
    urgency: 'medium',
    vendor: 'Recovery Systems Inc.',
    requestedBy: 'Mike Johnson',
    requestedDate: new Date('2024-01-14'),
    status: 'approved',
    approvedBy: 'John Doe',
    approvedDate: new Date('2024-01-16'),
    notes: 'Backup deployment bags for recovery system',
    team: 'Parachute',
    eisenhowerQuadrant: 'important-not-urgent'
  },
  {
    id: '3',
    itemName: 'Radio Frequency Amplifier',
    unitPrice: 275.00,
    quantity: 1,
    urgency: 'critical',
    vendor: 'RF Solutions Co.',
    requestedBy: 'David Brown',
    requestedDate: new Date('2024-01-13'),
    status: 'ordered',
    approvedBy: 'John Doe',
    approvedDate: new Date('2024-01-14'),
    notes: 'Critical for telemetry system upgrade',
    team: 'Telemetry',
    eisenhowerQuadrant: 'important-urgent'
  },
];

export const usePurchaseRequests = () => {
  return useQuery({
    queryKey: ['purchase-requests'],
    queryFn: async (): Promise<PurchaseRequest[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPurchaseRequests;
    },
  });
};

export const useAddPurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: Omit<PurchaseRequest, 'id' | 'requestedDate'>): Promise<PurchaseRequest> => {
      const newRequest: PurchaseRequest = {
        ...request,
        id: Date.now().toString(),
        requestedDate: new Date(),
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return newRequest;
    },
    onSuccess: (newRequest) => {
      queryClient.setQueryData(['purchase-requests'], (oldData: PurchaseRequest[] | undefined) => {
        return oldData ? [...oldData, newRequest] : [newRequest];
      });
    },
  });
};

export const useUpdatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: PurchaseRequest): Promise<PurchaseRequest> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return request;
    },
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(['purchase-requests'], (oldData: PurchaseRequest[] | undefined) => {
        return oldData ? oldData.map(request => 
          request.id === updatedRequest.id ? updatedRequest : request
        ) : [updatedRequest];
      });
    },
  });
};

export const useApprovePurchaseRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, approvedBy, notes }: { 
      requestId: string; 
      approvedBy: string; 
      notes?: string; 
    }): Promise<PurchaseRequest> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const existingRequests = queryClient.getQueryData(['purchase-requests']) as PurchaseRequest[];
      const request = existingRequests.find(r => r.id === requestId);
      
      if (!request) throw new Error('Request not found');
      
      return {
        ...request,
        status: 'approved',
        approvedBy,
        approvedDate: new Date(),
        notes: notes || request.notes,
      };
    },
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(['purchase-requests'], (oldData: PurchaseRequest[] | undefined) => {
        return oldData ? oldData.map(request => 
          request.id === updatedRequest.id ? updatedRequest : request
        ) : [updatedRequest];
      });
    },
  });
};