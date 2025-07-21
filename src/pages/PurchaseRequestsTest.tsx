import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePurchaseRequests, useLowStockItems } from '@/hooks/usePurchaseRequests';

const PurchaseRequestsTest = () => {
  const { data: requests = [], isLoading } = usePurchaseRequests();
  const lowStockItems = useLowStockItems();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test page to verify basic component loading.</p>
          <p>Requests count: {requests.length}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Low stock items: {lowStockItems?.length || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseRequestsTest;
