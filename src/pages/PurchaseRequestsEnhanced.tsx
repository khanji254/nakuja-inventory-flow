import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Upload, CheckCircle, XCircle, Clock, AlertTriangle, Copy, Eye, EyeOff, Palette, Edit3, Trash2, Package, ShoppingBag, FileText, Lock } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { VendorSelect } from '@/components/ui/vendor-select';
import { Switch } from '@/components/ui/switch';
import { CSVImportExport } from '@/components/ui/csv-import-export';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  usePurchaseRequests, 
  useAddPurchaseRequest, 
  useUpdateRequestStatus,
  usePurchaseLists,
  useCreatePurchaseList,
  useUpdatePurchaseList,
  useBulkImportPurchaseRequests,
  useLowStockItems
} from '@/hooks/usePurchaseRequests';
import { useVendors } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import { useMoveToPendingInventory } from '@/hooks/usePendingInventory';
import { PurchaseRequest, PurchaseList, Team } from '@/types';
import { usePermissions } from '@/lib/permissions';
import { useAuth } from '@/components/auth/AuthProvider';

const PurchaseRequests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<PurchaseList | null>(null);
  const [showLowStock, setShowLowStock] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  const { data: requests = [], isLoading } = usePurchaseRequests();
  const { data: purchaseLists = [] } = usePurchaseLists();
  const { data: vendors = [] } = useVendors();
  const lowStockData = useLowStockItems();
  const lowStockItems = Array.isArray(lowStockData) ? lowStockData : [];
  const addRequestMutation = useAddPurchaseRequest();
  const updateStatusMutation = useUpdateRequestStatus();
  const createListMutation = useCreatePurchaseList();
  const updateListMutation = useUpdatePurchaseList();
  const bulkImportMutation = useBulkImportPurchaseRequests();
  const moveToPendingMutation = useMoveToPendingInventory();
  const { toast } = useToast();
  const permissions = usePermissions();

  const [formData, setFormData] = useState({
    itemName: '',
    vendor: '',
    unitPrice: '',
    quantity: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: '',
    team: 'Avionics' as Team,
    isLowStockItem: false
  });

  const [listFormData, setListFormData] = useState({
    title: '',
    description: '',
    team: 'Avionics' as Team,
    category: '',
    color: '#3B82F6',
    vendor: '',
    notes: ''
  });

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request?.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request?.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request?.status === statusFilter;
    const matchesTeam = teamFilter === 'all' || request?.team === teamFilter;
    
    return matchesSearch && matchesStatus && matchesTeam;
  });

  // Status counts
  const statusCounts = {
    pending: requests.filter(r => r?.status === 'pending').length,
    approved: requests.filter(r => r?.status === 'approved').length,
    rejected: requests.filter(r => r?.status === 'rejected').length,
    ordered: requests.filter(r => r?.status === 'ordered').length,
    completed: requests.filter(r => r?.status === 'completed').length,
    lowStock: requests.filter(r => r?.isLowStockItem).length
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addRequestMutation.mutate({
      itemName: formData.itemName,
      vendor: formData.vendor,
      unitPrice: parseFloat(formData.unitPrice),
      quantity: parseInt(formData.quantity),
      urgency: formData.urgency,
      notes: formData.notes,
      team: formData.team,
      requestedBy: 'Current User',
      status: 'pending',
      isLowStockItem: formData.isLowStockItem
    }, {
      onSuccess: () => {
        toast({ title: 'Purchase request added successfully' });
        setIsDialogOpen(false);
        setFormData({
          itemName: '',
          vendor: '',
          unitPrice: '',
          quantity: '',
          urgency: 'medium',
          notes: '',
          team: 'Avionics',
          isLowStockItem: false
        });
      },
      onError: () => {
        toast({ title: 'Error adding purchase request', variant: 'destructive' });
      }
    });
  };

  const handleStatusUpdate = (requestId: string, status: PurchaseRequest['status'], notes?: string) => {
    updateStatusMutation.mutate({
      requestId,
      status,
      approvedBy: status === 'approved' ? 'Current User' : undefined,
      notes,
      orderNumber: status === 'ordered' ? `ORD-${Date.now()}` : undefined,
      deliveryDate: status === 'completed' ? new Date() : undefined
    }, {
      onSuccess: () => {
        toast({ title: `Request ${status} successfully` });
      },
      onError: () => {
        toast({ title: `Error updating request status`, variant: 'destructive' });
      }
    });
  };

  const handleMoveToPending = (request: PurchaseRequest) => {
    moveToPendingMutation.mutate(request, {
      onSuccess: () => {
        toast({ title: 'Item moved to pending inventory!' });
      },
      onError: () => {
        toast({ title: 'Error moving item to pending inventory', variant: 'destructive' });
      }
    });
  };

  const generatePurchaseListText = (list: PurchaseList) => {
    const vendorName = list.vendors.length > 0 ? vendors.find(v => v.id === list.vendors[0])?.name || 'Unknown Vendor' : 'Multiple Vendors';
    const total = list.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    let text = `Hi Dr Patrick.... I wanted to make the purchase from ${vendorName}... Here is a list\n\n`;
    text += `${list.title}\n\n`;
    text += `No.\tComponent\tQuantity\tUnit Price (KSh)\tTotal (KSh)\n\n`;
    
    list.items.forEach((item, index) => {
      const itemTotal = item.unitPrice * item.quantity;
      text += `${index + 1}\t${item.itemName}\t${item.quantity}\t${item.unitPrice}\t${itemTotal}\n`;
    });
    
    text += `\n\n---\n\n`;
    text += `Total: KSh ${total.toLocaleString()}\n\n`;
    
    if (list.notes) {
      text += `Notes: ${list.notes}`;
    }
    
    return text;
  };

  const copyToClipboard = (list: PurchaseList) => {
    const text = generatePurchaseListText(list);
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Purchase list copied to clipboard!' });
    }).catch(() => {
      toast({ title: 'Failed to copy to clipboard', variant: 'destructive' });
    });
  };

  const createListFromApproved = () => {
    const approvedRequests = requests.filter(r => r.status === 'approved' && !r.listId);
    
    if (approvedRequests.length === 0) {
      toast({ title: 'No approved requests available', variant: 'destructive' });
      return;
    }

    // Group by vendor
    const groupedByVendor = approvedRequests.reduce((acc, request) => {
      if (!acc[request.vendor]) {
        acc[request.vendor] = [];
      }
      acc[request.vendor].push(request);
      return acc;
    }, {} as Record<string, PurchaseRequest[]>);

    // Create lists for each vendor
    Object.entries(groupedByVendor).forEach(([vendorId, vendorRequests]) => {
      const vendor = vendors.find(v => v.id === vendorId);
      const vendorName = vendor?.name || 'Unknown Vendor';
      
      // Convert PurchaseRequest to PurchaseListItem
      const purchaseListItems = vendorRequests.map(request => ({
        id: request.id,
        requestId: request.id,
        itemName: request.itemName,
        description: request.notes,
        quantity: request.quantity,
        unitPrice: request.unitPrice,
        totalPrice: request.quantity * request.unitPrice,
        vendor: request.vendor,
        category: 'Mixed',
        urgency: request.urgency,
        notes: request.notes,
        status: 'pending' as const,
        team: request.team
      }));
      
      createListMutation.mutate({
        title: `${vendorName} Purchase List`,
        description: `Auto-generated from approved requests`,
        team: vendorRequests[0].team,
        category: 'Mixed',
        color: '#10B981',
        vendors: [vendorId],
        items: purchaseListItems,
        status: 'approved',
        createdBy: 'Current User',
        approvedDate: new Date(),
        notes: 'Auto-generated from approved purchase requests'
      });
    });

    toast({ title: 'Purchase lists created from approved requests!' });
  };

  const getStatusIcon = (status: PurchaseRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'ordered': return <ShoppingBag className="h-4 w-4" />;
      case 'completed': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: PurchaseRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: PurchaseRequest['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Requests</h1>
          <p className="text-muted-foreground">Manage purchase requests and automated ordering lists</p>
        </div>
        <div className="flex gap-2">
          {permissions.hasPermission('WRITE_ALL') && (
            <Button onClick={createListFromApproved} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Create Lists from Approved
            </Button>
          )}
          <Button onClick={() => setIsListDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Request
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && Array.isArray(lowStockItems) && lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Low Stock Alert</CardTitle>
              </div>
              <Switch
                checked={showLowStock}
                onCheckedChange={setShowLowStock}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              {(lowStockItems || []).length} items are running low on stock and may need to be ordered:
            </p>
            <div className="flex flex-wrap gap-2">
              {(lowStockItems || []).slice(0, 5).map((item: { id: string; name: string; currentStock: number }) => (
                <Badge key={item.id} variant="outline" className="text-orange-700 border-orange-300">
                  {item.name} ({item.currentStock} left)
                </Badge>
              ))}
              {(lowStockItems || []).length > 5 && (
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  +{(lowStockItems || []).length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.ordered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statusCounts.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statusCounts.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Purchase Requests</TabsTrigger>
          <TabsTrigger value="lists">Purchase Lists</TabsTrigger>
          <TabsTrigger value="approved">Approved Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
              <CardDescription>View and manage all purchase requests</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="Avionics">Avionics</SelectItem>
                    <SelectItem value="Telemetry">Telemetry</SelectItem>
                    <SelectItem value="Parachute">Parachute</SelectItem>
                    <SelectItem value="Recovery">Recovery</SelectItem>
                  </SelectContent>
                </Select>

                <CSVImportExport
                  data={filteredRequests}
                  type="purchase-requests"
                  onImport={permissions.canImportData() ? async (data) => {
                    return new Promise<void>((resolve, reject) => {
                      bulkImportMutation.mutate(data as PurchaseRequest[], {
                        onSuccess: () => {
                          toast({ title: 'Requests imported successfully' });
                          resolve();
                        },
                        onError: () => {
                          toast({ title: 'Import failed', variant: 'destructive' });
                          reject();
                        }
                      });
                    });
                  } : undefined}
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading requests...
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => {
                      const vendor = vendors.find(v => v.id === request.vendor);
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.itemName}</div>
                              <div className="text-sm text-muted-foreground">
                                Requested by {request.requestedBy}
                              </div>
                              {request.isLowStockItem && (
                                <Badge variant="outline" className="text-orange-600 border-orange-300 mt-1">
                                  Low Stock
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{vendor?.name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{vendor?.companyName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>Qty: {request.quantity}</div>
                              <div className="text-sm text-muted-foreground">
                                KSh {request.unitPrice.toLocaleString()} each
                              </div>
                              <div className="text-sm font-medium">
                                Total: KSh {(request.quantity * request.unitPrice).toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.team}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {request.urgency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {request.status === 'pending' && permissions.hasPermission('WRITE_ALL') && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {request.status === 'approved' && permissions.hasPermission('WRITE_ALL') && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, 'ordered')}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <ShoppingBag className="h-4 w-4" />
                                </Button>
                              )}
                              {request.status === 'ordered' && permissions.hasPermission('WRITE_ALL') && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, 'completed')}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                              )}
                              {(request.status === 'approved' || request.status === 'rejected') && permissions.hasPermission('WRITE_ALL') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStatusUpdate(request.id, 'pending')}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Undo
                                </Button>
                              )}
                              {!permissions.hasPermission('WRITE_ALL') && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Lock className="h-4 w-4" />
                                  <span className="text-xs">No Approval Rights</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Lists</CardTitle>
              <CardDescription>Organized purchase lists for vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {purchaseLists.map((list) => {
                  const vendor = list.vendors.length > 0 ? vendors.find(v => v.id === list.vendors[0]) : null;
                  return (
                    <Card key={list.id} className="border-l-4" style={{ borderLeftColor: list.color }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{list.title}</CardTitle>
                            <CardDescription>
                              {vendor?.name} • {list.items.length} items • KSh {list.totalAmount.toLocaleString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge style={{ backgroundColor: list.color, color: 'white' }}>
                              {list.status}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(list)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy List
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {list.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.itemName}</span>
                              <span>Qty: {item.quantity} × KSh {item.unitPrice} = KSh {(item.quantity * item.unitPrice).toLocaleString()}</span>
                            </div>
                          ))}
                          {list.items.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{list.items.length - 3} more items
                            </div>
                          )}
                        </div>
                        {list.notes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <strong>Notes:</strong> {list.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Purchase Tracking</CardTitle>
              <CardDescription>Track approved purchases through completion</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.filter(r => ['approved', 'ordered', 'completed'].includes(r.status)).map((request) => {
                    const vendor = vendors.find(v => v.id === request.vendor);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.itemName}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {request.quantity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vendor?.name || 'Unknown'}</TableCell>
                        <TableCell>KSh {(request.quantity * request.unitPrice).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {request.orderNumber && <div>Order: {request.orderNumber}</div>}
                            {request.deliveryDate && (
                              <div>Delivered: {request.deliveryDate.toLocaleDateString()}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {request.status === 'approved' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'ordered')}
                              >
                                Mark Ordered
                              </Button>
                            )}
                            {request.status === 'ordered' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'completed')}
                              >
                                Mark Completed
                              </Button>
                            )}
                            {request.status === 'completed' && !request.movedToPending && permissions.canEditInventory() && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMoveToPending(request)}
                                disabled={moveToPendingMutation.isPending}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Move to Pending
                              </Button>
                            )}
                            {request.status === 'completed' && request.movedToPending && (
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                Moved to Pending
                              </Badge>
                            )}
                            {request.status === 'completed' && !request.movedToPending && !permissions.canEditInventory() && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Lock className="h-4 w-4" />
                                <span className="text-xs">Inventory Access Required</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Purchase Request</DialogTitle>
            <DialogDescription>Create a new purchase request</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  required
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
              <div className="space-y-2">
                <Label>Unit Price (KSh)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Select value={formData.team} onValueChange={(value) => setFormData({...formData, team: value as Team})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Avionics">Avionics</SelectItem>
                    <SelectItem value="Telemetry">Telemetry</SelectItem>
                    <SelectItem value="Parachute">Parachute</SelectItem>
                    <SelectItem value="Recovery">Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value as 'low' | 'medium' | 'high' | 'critical'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isLowStockItem}
                onCheckedChange={(checked) => setFormData({...formData, isLowStockItem: checked})}
              />
              <Label>This is a low stock item</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addRequestMutation.isPending}>
                Add Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseRequests;
