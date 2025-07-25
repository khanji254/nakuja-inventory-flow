import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Upload, CheckCircle, XCircle, Clock, AlertTriangle, Copy, Eye, EyeOff, Palette, Edit3, Trash2, Package, ShoppingBag, FileText, FolderPlus, Merge, Split, List } from 'lucide-react';
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
import CSVImportExport from '@/components/ui/csv-import-export';
import { 
  usePurchaseRequests, 
  useAddPurchaseRequest, 
  useUpdateRequestStatus,
  usePurchaseLists,
  useCreatePurchaseList,
  useUpdatePurchaseList,
  useBulkImportPurchaseRequests,
  useLowStockItems,
  useAddItemToList,
  useUpdateListItem,
  useRemoveItemFromList
} from '@/hooks/usePurchaseRequests';
import { useVendors } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import { useMoveToPendingInventory } from '@/hooks/usePendingInventory';
import { PurchaseRequest, PurchaseList, PurchaseListItem, Team } from '@/types';

const PurchaseRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<PurchaseList | null>(null);
  const [showLowStock, setShowLowStock] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  
  // Custom request lists state
  const [isCustomListDialogOpen, setIsCustomListDialogOpen] = useState(false);
  const [isCombineDialogOpen, setIsCombineDialogOpen] = useState(false);
  const [selectedCustomLists, setSelectedCustomLists] = useState<string[]>([]);
  const [customRequestLists, setCustomRequestLists] = useState<any[]>([]);
  const [customListFormData, setCustomListFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    category: ''
  });
  
  // States for item management
  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(false);
  const [itemSelectionMode, setItemSelectionMode] = useState<'category' | 'location' | 'individual'>('individual');
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: requests = [], isLoading } = usePurchaseRequests();
  const { data: purchaseLists = [] } = usePurchaseLists();
  const { data: vendors = [] } = useVendors();
  const lowStockItems = useLowStockItems();
  const addRequestMutation = useAddPurchaseRequest();
  const updateStatusMutation = useUpdateRequestStatus();
  const createListMutation = useCreatePurchaseList();
  const updateListMutation = useUpdatePurchaseList();
  const bulkImportMutation = useBulkImportPurchaseRequests();
  
  // New item management mutations
  const addItemMutation = useAddItemToList();
  const updateItemMutation = useUpdateListItem();
  const removeItemMutation = useRemoveItemFromList();
  const moveToPendingMutation = useMoveToPendingInventory();
  
  const { toast } = useToast();

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
    vendors: [] as string[], // Changed to array
    notes: ''
  });

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesTeam = teamFilter === 'all' || request.team === teamFilter;
    const matchesLowStock = !showLowStock || request.isLowStockItem;
    
    return matchesSearch && matchesStatus && matchesTeam && (!showLowStock || matchesLowStock);
  });

  // Status counts
  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    ordered: requests.filter(r => r.status === 'ordered').length,
    completed: requests.filter(r => r.status === 'completed').length,
    lowStock: requests.filter(r => r.isLowStockItem).length
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

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listFormData.title || listFormData.vendors.length === 0) {
      toast({ title: 'Please fill in required fields (title and at least one vendor)', variant: 'destructive' });
      return;
    }

    createListMutation.mutate({
      title: listFormData.title,
      description: listFormData.description,
      team: listFormData.team as any,
      category: listFormData.category || 'General',
      color: listFormData.color,
      vendors: listFormData.vendors,
      items: [], // Start with empty items, can be added later
      status: 'draft',
      createdBy: 'Current User',
      notes: listFormData.notes
    }, {
      onSuccess: () => {
        toast({ title: 'Purchase list created successfully' });
        setIsListDialogOpen(false);
        setListFormData({
          title: '',
          description: '',
          team: 'Avionics',
          category: '',
          color: '#3B82F6',
          vendors: [],
          notes: ''
        });
      },
      onError: () => {
        toast({ title: 'Error creating purchase list', variant: 'destructive' });
      }
    });
  };

  const generatePurchaseListText = (list: PurchaseList) => {
    const vendorNames = list.vendors.map(vId => vendors.find(v => v.id === vId)?.name || 'Unknown Vendor').join(', ');
    const total = list.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    let text = `Hi Dr Patrick.... I wanted to make the purchase from ${vendorNames}... Here is a list\n\n`;
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
      const listItems: PurchaseListItem[] = vendorRequests.map(request => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        requestId: request.id,
        itemName: request.itemName,
        description: request.description || '',
        quantity: request.quantity,
        unitPrice: request.unitPrice,
        totalPrice: request.quantity * request.unitPrice,
        vendor: request.vendor,
        category: 'General',
        urgency: request.urgency,
        status: 'pending' as const,
        team: request.team
      }));
      
      createListMutation.mutate({
        title: `${vendorName} Purchase List`,
        description: `Auto-generated from approved requests`,
        team: vendorRequests[0].team,
        category: 'Mixed',
        color: '#10B981',
        vendors: [vendorId], // Use vendors array
        items: listItems,
        status: 'approved',
        createdBy: 'Current User',
        notes: 'Auto-generated from approved purchase requests'
      });
    });

    toast({ title: 'Purchase lists created from approved requests!' });
  };

  // Custom request list management functions
  const handleCreateCustomList = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customListFormData.name) {
      toast({ title: 'Please enter a list name', variant: 'destructive' });
      return;
    }

    const newCustomList = {
      id: `custom-${Date.now()}`,
      name: customListFormData.name,
      description: customListFormData.description,
      color: customListFormData.color,
      category: customListFormData.category || 'General',
      requests: [],
      createdAt: new Date(),
      createdBy: 'Current User'
    };

    setCustomRequestLists(prev => [...prev, newCustomList]);
    toast({ title: 'Custom request list created successfully!' });
    setIsCustomListDialogOpen(false);
    setCustomListFormData({ name: '', description: '', color: '#3B82F6', category: '' });
  };

  const handleDeleteCustomList = (listId: string) => {
    setCustomRequestLists(prev => prev.filter(list => list.id !== listId));
    toast({ title: 'Custom list deleted successfully!' });
  };

  const handleCombineLists = () => {
    if (selectedCustomLists.length < 2) {
      toast({ title: 'Please select at least 2 lists to combine', variant: 'destructive' });
      return;
    }

    const listsToMerge = customRequestLists.filter(list => selectedCustomLists.includes(list.id));
    const combinedRequests = listsToMerge.flatMap(list => list.requests);
    
    const combinedList = {
      id: `combined-${Date.now()}`,
      name: `Combined List (${listsToMerge.map(l => l.name).join(', ')})`,
      description: `Combined from: ${listsToMerge.map(l => l.name).join(', ')}`,
      color: listsToMerge[0].color,
      category: 'Combined',
      requests: combinedRequests,
      createdAt: new Date(),
      createdBy: 'Current User'
    };

    setCustomRequestLists(prev => [
      ...prev.filter(list => !selectedCustomLists.includes(list.id)),
      combinedList
    ]);
    
    setSelectedCustomLists([]);
    setIsCombineDialogOpen(false);
    toast({ title: 'Lists combined successfully!' });
  };

  const handleSeparateList = (listId: string) => {
    const listToSeparate = customRequestLists.find(list => list.id === listId);
    if (!listToSeparate || listToSeparate.requests.length === 0) {
      toast({ title: 'Cannot separate empty list', variant: 'destructive' });
      return;
    }

    const separatedLists = listToSeparate.requests.map((request: any, index: number) => ({
      id: `separated-${Date.now()}-${index}`,
      name: `${listToSeparate.name} - Item ${index + 1}`,
      description: `Separated from ${listToSeparate.name}: ${request.itemName}`,
      color: listToSeparate.color,
      category: listToSeparate.category,
      requests: [request],
      createdAt: new Date(),
      createdBy: 'Current User'
    }));

    setCustomRequestLists(prev => [
      ...prev.filter(list => list.id !== listId),
      ...separatedLists
    ]);
    
    toast({ title: 'List separated successfully!' });
  };

  const handleMoveRequestToCustomList = (request: PurchaseRequest, customListId: string) => {
    setCustomRequestLists(prev => prev.map(list => 
      list.id === customListId 
        ? { ...list, requests: [...list.requests, request] }
        : list
    ));
    toast({ title: 'Request moved to custom list!' });
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
          <Button onClick={() => setIsCustomListDialogOpen(true)} variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Custom List
          </Button>
          <Button onClick={createListFromApproved} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Create Lists from Approved
          </Button>
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
      {lowStockItems.length > 0 && (
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
              {lowStockItems.length} items are running low on stock and may need to be ordered:
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 5).map((item: any) => (
                <Badge key={item.id} variant="outline" className="text-orange-700 border-orange-300">
                  {item.name} ({item.currentStock} left)
                </Badge>
              ))}
              {lowStockItems.length > 5 && (
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  +{lowStockItems.length - 5} more
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
          <TabsTrigger value="custom-lists">Custom Lists</TabsTrigger>
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
                  onImport={async (data) => {
                    bulkImportMutation.mutate(data as PurchaseRequest[], {
                      onSuccess: () => toast({ title: 'Requests imported successfully' }),
                      onError: () => toast({ title: 'Import failed', variant: 'destructive' })
                    });
                  }}
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
                              {request.status === 'pending' && (
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
                              {request.status === 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, 'ordered')}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <ShoppingBag className="h-4 w-4" />
                                </Button>
                              )}
                              {request.status === 'ordered' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(request.id, 'completed')}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                              )}
                              {(request.status === 'approved' || request.status === 'rejected') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStatusUpdate(request.id, 'pending')}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Undo
                                </Button>
                              )}
                              {customRequestLists.length > 0 && (
                                <Select onValueChange={(value) => handleMoveRequestToCustomList(request, value)}>
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue placeholder="Add to list" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {customRequestLists.map((customList) => (
                                      <SelectItem key={customList.id} value={customList.id}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded" 
                                            style={{ backgroundColor: customList.color }}
                                          />
                                          {customList.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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

        <TabsContent value="custom-lists" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Request Lists</CardTitle>
                  <CardDescription>Organize purchase requests into custom categories</CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedCustomLists.length > 1 && (
                    <Button onClick={() => setIsCombineDialogOpen(true)} variant="outline" size="sm">
                      <Merge className="h-4 w-4 mr-2" />
                      Combine Selected
                    </Button>
                  )}
                  <Button onClick={() => setIsCustomListDialogOpen(true)} size="sm">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Custom List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {customRequestLists.map((customList) => (
                  <Card key={customList.id} className="border-l-4" style={{ borderLeftColor: customList.color }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCustomLists.includes(customList.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCustomLists(prev => [...prev, customList.id]);
                              } else {
                                setSelectedCustomLists(prev => prev.filter(id => id !== customList.id));
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <CardTitle className="text-lg">{customList.name}</CardTitle>
                            <CardDescription>
                              {customList.description} • {customList.requests.length} requests
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: customList.color, color: 'white' }}>
                            {customList.category}
                          </Badge>
                          {customList.requests.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSeparateList(customList.id)}
                            >
                              <Split className="h-4 w-4 mr-2" />
                              Separate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCustomList(customList.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {customList.requests.map((request: any) => (
                          <div key={request.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{request.itemName}</span>
                              <span className="text-muted-foreground ml-2">({request.quantity}x)</span>
                            </div>
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {request.urgency}
                            </Badge>
                          </div>
                        ))}
                        {customList.requests.length === 0 && (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No requests in this list yet. Drag requests from the main list to add them.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {customRequestLists.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No custom lists created yet.</p>
                    <p className="text-sm">Create your first custom list to organize purchase requests.</p>
                  </div>
                )}
              </div>
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
                  const listVendors = list.vendors.map(vId => vendors.find(v => v.id === vId)).filter(Boolean);
                  return (
                    <Card key={list.id} className="border-l-4" style={{ borderLeftColor: list.color }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{list.title}</CardTitle>
                            <CardDescription>
                              {listVendors.length > 0 ? listVendors.map(v => v?.name).join(', ') : 'No vendors'} • {list.items.length} items • KSh {list.totalAmount.toLocaleString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge style={{ backgroundColor: list.color, color: 'white' }}>
                              {list.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedList(list);
                                setIsDraftDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              New Draft
                            </Button>
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
                              <span>Qty: {item.quantity} × KSh {item.unitPrice} = KSh {item.totalPrice.toLocaleString()}</span>
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
                            {request.status === 'completed' && !request.movedToPending && (
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
                <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value as any})}>
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

      {/* New List Dialog */}
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Purchase List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleListSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="list-title">Title *</Label>
                <Input
                  id="list-title"
                  value={listFormData.title}
                  onChange={(e) => setListFormData({ ...listFormData, title: e.target.value })}
                  placeholder="e.g., Weekly Hardware Order"
                  required
                />
              </div>
              <div>
                <Label htmlFor="list-team">Team</Label>
                <Select value={listFormData.team} onValueChange={(value) => setListFormData({ ...listFormData, team: value as Team })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Avionics">Avionics</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="list-description">Description</Label>
              <Textarea
                id="list-description"
                value={listFormData.description}
                onChange={(e) => setListFormData({ ...listFormData, description: e.target.value })}
                placeholder="Brief description of this purchase list"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="list-category">Category</Label>
                <Input
                  id="list-category"
                  value={listFormData.category}
                  onChange={(e) => setListFormData({ ...listFormData, category: e.target.value })}
                  placeholder="e.g., Electronics, Tools, Materials"
                />
              </div>
              <div>
                <Label htmlFor="list-vendors">Vendors *</Label>
                <div className="space-y-2">
                  <VendorSelect
                    value=""
                    onValueChange={(value) => {
                      if (value && !listFormData.vendors.includes(value)) {
                        setListFormData({ 
                          ...listFormData, 
                          vendors: [...listFormData.vendors, value] 
                        });
                      }
                    }}
                    placeholder="Add vendors to this list"
                  />
                  {listFormData.vendors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {listFormData.vendors.map((vendorId) => {
                        const vendor = vendors.find(v => v.id === vendorId);
                        return (
                          <Badge key={vendorId} variant="secondary" className="text-xs">
                            {vendor?.name || vendorId}
                            <button
                              type="button"
                              onClick={() => setListFormData({
                                ...listFormData,
                                vendors: listFormData.vendors.filter(v => v !== vendorId)
                              })}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="list-color">List Color</Label>
              <div className="flex gap-2 mt-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${listFormData.color === color ? 'border-gray-900' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setListFormData({ ...listFormData, color })}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="list-notes">Notes</Label>
              <Textarea
                id="list-notes"
                value={listFormData.notes}
                onChange={(e) => setListFormData({ ...listFormData, notes: e.target.value })}
                placeholder="Additional notes or special instructions"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsListDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createListMutation.isPending}>
                {createListMutation.isPending ? 'Creating...' : 'Create List'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Draft Dialog */}
      <Dialog open={isDraftDialogOpen} onOpenChange={setIsDraftDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Items to "{selectedList?.title}"</DialogTitle>
          </DialogHeader>
          
          <Tabs value={itemSelectionMode} onValueChange={(value: any) => setItemSelectionMode(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="individual">Individual Selection</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="location">By Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual" className="space-y-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select individual items from inventory and approved requests
                </div>
                
                {/* Inventory Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Inventory Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {/* This would be populated with inventory items */}
                      <div className="text-sm text-muted-foreground">
                        Connect with inventory to show available items
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Approved Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Approved Purchase Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {requests.filter(r => r.status === 'approved' && !r.listId).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium">{request.itemName}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {request.quantity} × KSh {request.unitPrice} • {request.vendor}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (selectedList) {
                                addItemMutation.mutate({
                                  listId: selectedList.id,
                                  item: {
                                    requestId: request.id,
                                    itemName: request.itemName,
                                    description: request.description || '',
                                    quantity: request.quantity,
                                    unitPrice: request.unitPrice,
                                    totalPrice: request.quantity * request.unitPrice,
                                    vendor: request.vendor,
                                    category: 'General',
                                    urgency: request.urgency,
                                    status: 'pending',
                                    team: request.team
                                  }
                                }, {
                                  onSuccess: () => {
                                    toast({ title: 'Item added to list' });
                                  }
                                });
                              }
                            }}
                          >
                            Add to List
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="category" className="space-y-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select items by category (Electronics, Mechanical, etc.)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Electronics', 'Mechanical', 'Tools', 'Materials', 'Safety', 'Testing'].map((category) => (
                    <Card key={category} className="cursor-pointer hover:shadow-md">
                      <CardContent className="p-4 text-center">
                        <div className="font-medium">{category}</div>
                        <div className="text-sm text-muted-foreground">
                          Click to add all {category.toLowerCase()} items
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select items by storage location
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Store A', 'Store B', 'Store C', 'Warehouse', 'Lab Storage', 'Office'].map((location) => (
                    <Card key={location} className="cursor-pointer hover:shadow-md">
                      <CardContent className="p-4 text-center">
                        <div className="font-medium">{location}</div>
                        <div className="text-sm text-muted-foreground">
                          Click to add all items from {location}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDraftDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom List Creation Dialog */}
      <Dialog open={isCustomListDialogOpen} onOpenChange={setIsCustomListDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Request List</DialogTitle>
            <DialogDescription>
              Create a custom list to organize your purchase requests
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomList} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customListName">List Name *</Label>
              <Input
                id="customListName"
                value={customListFormData.name}
                onChange={(e) => setCustomListFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Electronics Components"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customListDescription">Description</Label>
              <Textarea
                id="customListDescription"
                value={customListFormData.description}
                onChange={(e) => setCustomListFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this list"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customListCategory">Category</Label>
              <Input
                id="customListCategory"
                value={customListFormData.category}
                onChange={(e) => setCustomListFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Electronics, Tools, Materials"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customListColor">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="customListColor"
                  value={customListFormData.color}
                  onChange={(e) => setCustomListFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-8 rounded border"
                />
                <Input
                  value={customListFormData.color}
                  onChange={(e) => setCustomListFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCustomListDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create List
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Combine Lists Dialog */}
      <Dialog open={isCombineDialogOpen} onOpenChange={setIsCombineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Combine Selected Lists</DialogTitle>
            <DialogDescription>
              Combine {selectedCustomLists.length} selected lists into one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <strong>Selected Lists:</strong>
              <ul className="mt-2 space-y-1">
                {selectedCustomLists.map(listId => {
                  const list = customRequestLists.find(l => l.id === listId);
                  return (
                    <li key={listId} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: list?.color }}
                      />
                      {list?.name} ({list?.requests.length} requests)
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              All requests from the selected lists will be merged into a new combined list. 
              The original lists will be deleted.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCombineDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCombineLists}>
              Combine Lists
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseRequests;
