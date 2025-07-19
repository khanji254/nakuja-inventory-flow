import React, { useState } from 'react';
import { Check, X, Edit3, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePendingInventory, useMovePendingToInventory, useUpdatePendingItem } from '@/hooks/usePendingInventory';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types';

interface ConfirmReceiptData {
  actualQuantity: number;
  qualityNotes: string;
  condition: 'good' | 'damaged' | 'partial';
}

const PendingInventoryManager = () => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmReceiptData>({
    actualQuantity: 0,
    qualityNotes: '',
    condition: 'good'
  });

  const { data: pendingItems = [], isLoading } = usePendingInventory();
  const movePendingMutation = useMovePendingToInventory();
  const updatePendingMutation = useUpdatePendingItem();
  const { toast } = useToast();

  const handleConfirmReceipt = (item: InventoryItem) => {
    setSelectedItem(item);
    setConfirmData({
      actualQuantity: item.quantity,
      qualityNotes: '',
      condition: 'good'
    });
    setConfirmDialogOpen(true);
  };

  const handleMoveToInventory = () => {
    if (!selectedItem) return;

    movePendingMutation.mutate({
      pendingItem: selectedItem,
      actualQuantity: confirmData.actualQuantity
    }, {
      onSuccess: () => {
        toast({ title: 'Item moved to inventory successfully!' });
        setConfirmDialogOpen(false);
        setSelectedItem(null);
      },
      onError: () => {
        toast({ title: 'Error moving item to inventory', variant: 'destructive' });
      }
    });
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (!selectedItem) return;

    updatePendingMutation.mutate(selectedItem, {
      onSuccess: () => {
        toast({ title: 'Pending item updated successfully!' });
        setEditDialogOpen(false);
        setSelectedItem(null);
      },
      onError: () => {
        toast({ title: 'Error updating pending item', variant: 'destructive' });
      }
    });
  };

  if (isLoading) {
    return <div>Loading pending inventory...</div>;
  }

  if (pendingItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pending Inventory Items
          </CardTitle>
          <CardDescription>
            Items awaiting confirmation and processing into main inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending items at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pending Inventory Items ({pendingItems.length})
          </CardTitle>
          <CardDescription>
            Items purchased and awaiting receipt confirmation before being added to main inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Expected Qty</TableHead>
                <TableHead>Unit Price (KSh)</TableHead>
                <TableHead>Total Value (KSh)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.vendor}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>KSh {item.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>KSh {(item.unitPrice * item.quantity).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending Receipt
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConfirmReceipt(item)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Received
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirm Receipt Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Item Receipt</DialogTitle>
            <DialogDescription>
              Confirm that you have received {selectedItem?.name} and specify the actual quantity received.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Actual Quantity Received</Label>
              <Input
                type="number"
                value={confirmData.actualQuantity}
                onChange={(e) => setConfirmData({
                  ...confirmData,
                  actualQuantity: parseInt(e.target.value) || 0
                })}
              />
              <p className="text-sm text-muted-foreground">
                Expected: {selectedItem?.quantity} units
              </p>
            </div>
            <div className="space-y-2">
              <Label>Quality Notes</Label>
              <Textarea
                value={confirmData.qualityNotes}
                onChange={(e) => setConfirmData({
                  ...confirmData,
                  qualityNotes: e.target.value
                })}
                placeholder="Any notes about the condition, quality, or issues with the received items..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveToInventory}>
              <Check className="h-4 w-4 mr-2" />
              Move to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pending Item</DialogTitle>
            <DialogDescription>
              Update details for the pending inventory item.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedItem.description || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    description: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Price (KSh)</Label>
                  <Input
                    type="number"
                    value={selectedItem.unitPrice}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      unitPrice: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Quantity</Label>
                  <Input
                    type="number"
                    value={selectedItem.quantity}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      quantity: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>
              <Edit3 className="h-4 w-4 mr-2" />
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingInventoryManager;