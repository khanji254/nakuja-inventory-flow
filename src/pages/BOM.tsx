import { useState } from 'react';
import { Plus, Download, Upload, Link2, AlertCircle, DollarSign, Package, FileText, ShoppingBag, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorSelect } from '@/components/ui/vendor-select';
import CSVImportExport from '@/components/ui/csv-import-export';
import { useBOMData } from '@/hooks/useBOMData';
import { useInventoryData } from '@/hooks/useInventoryData';
import { syncService } from '@/lib/sync-service';
import { useToast } from '@/hooks/use-toast';
import { BOMItem } from '@/types';
import { User, usePermissions } from '@/lib/permissions';

interface BOMProps {
  user: User;
}

const BOM = ({ user }: BOMProps) => {
  const permissions = usePermissions(user);
  const [selectedTeam, setSelectedTeam] = useState('Recovery');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: bomData = [] } = useBOMData();
  const { data: inventory = [] } = useInventoryData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    quantity: '',
    unitPrice: '',
    vendor: '',
    partNumber: '',
    category: 'electronics'
  });

  const teams = ['Recovery', 'Avionics', 'Telemetry', 'Parachute'];
  const teamBOMs = bomData.filter(item => item.team === selectedTeam);

  // Flatten BOM items for CSV export
  const flattenedBOMItems: BOMItem[] = bomData.flatMap(bom => 
    bom.items?.map(item => ({
      ...item,
      team: bom.team,
      requiredQuantity: item.quantity, // Map quantity to requiredQuantity for consistency
    })) || []
  );

  const handleBOMImport = async (importedItems: BOMItem[]) => {
    // Placeholder for BOM import functionality
    // In a real implementation, you would process and add these items to the appropriate BOMs
    throw new Error('BOM import functionality is not yet implemented');
  };

  const calculateBOMCost = (team: string) => {
    return bomData
      .filter(item => item.team === team)
      .reduce((sum, item) => sum + (item.unitPrice * item.requiredQuantity), 0);
  };

  const downloadCSV = (type: 'newly-purchased' | 'requirements' | 'replacements' | 'full-inventory') => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'newly-purchased':
        csvContent = syncService.generateNewlyPurchasedCSV();
        filename = 'newly-purchased-components.csv';
        break;
      case 'requirements':
        csvContent = syncService.generateBOMRequirementsCSV(selectedTeam);
        filename = `${selectedTeam}-bom-requirements.csv`;
        break;
      case 'replacements':
        csvContent = syncService.generateReplacementItemsCSV();
        filename = 'replacement-items.csv';
        break;
      case 'full-inventory':
        csvContent = syncService.generateInventoryCSV();
        filename = 'full-inventory.csv';
        break;
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: `Downloaded ${filename}` });
  };

  const getInventoryAvailability = (bomItem: any) => {
    const inventoryItem = inventory.find(inv => 
      inv.name.toLowerCase() === bomItem.itemName.toLowerCase() ||
      inv.partNumber === bomItem.partNumber
    );
    
    if (!inventoryItem) return { available: 0, status: 'not-in-stock' };
    
    const available = inventoryItem.quantity;
    const required = bomItem.requiredQuantity;
    
    if (available >= required) return { available, status: 'sufficient' };
    if (available > 0) return { available, status: 'partial' };
    return { available: 0, status: 'insufficient' };
  };

  const getAvailabilityBadge = (status: string, available: number, required: number) => {
    switch (status) {
      case 'sufficient':
        return <Badge className="bg-green-500">✓ In Stock ({available})</Badge>;
      case 'partial':
        return <Badge variant="secondary">⚠ Partial ({available}/{required})</Badge>;
      case 'insufficient':
        return <Badge variant="destructive">✗ Out of Stock</Badge>;
      default:
        return <Badge variant="outline">? Not Tracked</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bill of Materials</h1>
          <p className="text-muted-foreground">Manage BOMs by team and track inventory availability</p>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(value) => downloadCSV(value as any)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Download Lists..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newly-purchased">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Newly Purchased
                </div>
              </SelectItem>
              <SelectItem value="requirements">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  BOM Requirements
                </div>
              </SelectItem>
              <SelectItem value="replacements">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Replacement Items
                </div>
              </SelectItem>
              <SelectItem value="full-inventory">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Full Inventory
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {permissions.canImportData() && (
            <CSVImportExport
              data={flattenedBOMItems}
              type="bom"
              onImport={handleBOMImport}
            />
          )}
          {(permissions.canEditTeam(user.teamId || '') || permissions.hasPermission('WRITE_ALL')) ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add BOM Item</DialogTitle>
                <DialogDescription>
                  Add a new item to the {selectedTeam} team's bill of materials
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    value={formData.itemName}
                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Part Number</Label>
                  <Input
                    value={formData.partNumber}
                    onChange={(e) => setFormData({...formData, partNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="fasteners">Fasteners</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity Required</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price (KSh)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <VendorSelect
                    value={formData.vendor}
                    onValueChange={(value) => setFormData({...formData, vendor: value})}
                    placeholder="Select vendor..."
                    showPaymentMethods={false}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Item description and specifications..."
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Add to BOM</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-sm">No Edit Access</span>
            </div>
          )}
        </div>
      </div>

      {/* Team Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {teams.map(team => (
          <Card key={team} className={selectedTeam === team ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{team} Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {calculateBOMCost(team).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {bomData.filter(item => item.team === team).length} items
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => setSelectedTeam(team)}
              >
                View BOM
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BOM Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{selectedTeam} Team BOM</CardTitle>
              <CardDescription>
                Bill of materials with inventory availability tracking
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">Total Cost: </span>
                <span className="text-2xl font-bold">KSh {calculateBOMCost(selectedTeam).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Required Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamBOMs.map((item) => {
                const availability = getInventoryAvailability(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.partNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.requiredQuantity}</TableCell>
                    <TableCell>KSh {item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell>KSh {(item.unitPrice * item.requiredQuantity).toLocaleString()}</TableCell>
                    <TableCell>
                      {getAvailabilityBadge(availability.status, availability.available, item.requiredQuantity)}
                    </TableCell>
                    <TableCell>{item.vendor}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {availability.status !== 'sufficient' && (
                          <Button size="sm" variant="outline">
                            <Package className="h-3 w-3 mr-1" />
                            Order
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Link2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* BOM Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teams.map(team => (
                <div key={team} className="flex justify-between">
                  <span>{team}:</span>
                  <span className="font-medium">KSh {calculateBOMCost(team).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span>KSh {teams.reduce((sum, team) => sum + calculateBOMCost(team), 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>In Stock:</span>
                <span className="text-green-600 font-medium">
                  {teamBOMs.filter(item => getInventoryAvailability(item).status === 'sufficient').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Partial:</span>
                <span className="text-yellow-600 font-medium">
                  {teamBOMs.filter(item => getInventoryAvailability(item).status === 'partial').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Need to Order:</span>
                <span className="text-red-600 font-medium">
                  {teamBOMs.filter(item => ['insufficient', 'not-in-stock'].includes(getInventoryAvailability(item).status)).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground">
                Items that need immediate attention based on inventory levels and project priorities.
              </div>
              <div className="space-y-1">
                {teamBOMs
                  .filter(item => getInventoryAvailability(item).status !== 'sufficient')
                  .slice(0, 3)
                  .map(item => (
                    <div key={item.id} className="text-sm">
                      • {item.itemName}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BOM;