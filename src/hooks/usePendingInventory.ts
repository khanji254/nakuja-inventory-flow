import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryItem, PurchaseRequest } from '@/types';
import { syncService } from '@/lib/sync-service';
import { localStorageService } from '@/lib/storage-service';

export const usePendingInventory = () => {
  return useQuery({
    queryKey: ['pending-inventory'],
    queryFn: () => syncService.getPendingInventoryItems(),
  });
};

export const useMoveToPendingInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (purchaseRequest: PurchaseRequest) => 
      syncService.moveToPendingInventory(purchaseRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
    },
  });
};

export const useMovePendingToInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pendingItem, actualQuantity }: { pendingItem: InventoryItem; actualQuantity: number }) => 
      syncService.movePendingToInventory(pendingItem, actualQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['pending-inventory'] });
    },
  });
};

export const useUpdatePendingItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedItem: InventoryItem) => {
      const pendingItems = localStorageService.getItem<InventoryItem[]>('pending-inventory') || [];
      const updated = pendingItems.map(item => 
        item.id === updatedItem.id ? { ...updatedItem, lastUpdated: new Date() } : item
      );
      localStorageService.setItem('pending-inventory', updated);
      return updatedItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-inventory'] });
    },
  });
};