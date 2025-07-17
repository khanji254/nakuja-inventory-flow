import { useState } from 'react';
import { Plus, Search, Filter, Download, Upload, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePurchaseRequests, useAddPurchaseRequest, useApprovePurchaseRequest } from '@/hooks/usePurchaseRequests';
import { useToast } from '@/hooks/use-toast';

const PurchaseRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: requests = [], isLoading } = usePurchaseRequests();
  const addRequestMutation = useAddPurchaseRequest();
  const approveMutation = useApprovePurchaseRequest();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    itemName: '',
    unitPrice: '',
    quantity: '',
    urgency: 'medium',
    vendor: '',
    requestedBy: '',
    notes: '',
    team: 'Recovery',
    eisenhowerQuadrant: 'important-not-urgent'
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequestMutation.mutate({
      itemName: formData.itemName,
      unitPrice: parseFloat(formData.unitPrice),
      quantity: parseInt(formData.quantity),
      urgency: formData.urgency as 'low' | 'medium' | 'high' | 'critical',
      vendor: formData.vendor,
      requestedBy: formData.requestedBy,
      status: 'pending',
      notes: formData.notes,
      team: formData.team,
      eisenhowerQuadrant: formData.eisenhowerQuadrant as any
    }, {
      onSuccess: () => {
        toast({ title: 'Purchase request submitted successfully' });
        setIsDialogOpen(false);
        setFormData({
          itemName: '',
          unitPrice: '',
          quantity: '',
          urgency: 'medium',
          vendor: '',
          requestedBy: '',
          notes: '',
          team: 'Recovery',
          eisenhowerQuadrant: 'important-not-urgent'
        });
      }
    });
  };

  const handleApprove = (requestId: string) => {
    approveMutation.mutate({
      requestId,
      approvedBy: 'Current User', // In real app, get from auth context
      notes: 'Approved via dashboard'
    }, {
      onSuccess: () => {
        toast({ title: 'Purchase request approved' });
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ordered': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  const totalBudget = filteredRequests.reduce((sum, req) => sum + (req.unitPrice * req.quantity), 0);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Requests</h1>
          <p className="text-muted-foreground">Manage team purchase requests and approvals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Purchase Request</DialogTitle>
              <DialogDescription>
                Fill out the details for your purchase request
              </DialogDescription>
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
                  <Input
                    value={formData.vendor}
                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price ($)</Label>
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
                  <Select value={formData.team} onValueChange={(value) => setFormData({...formData, team: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recovery">Recovery</SelectItem>
                      <SelectItem value="Avionics">Avionics</SelectItem>
                      <SelectItem value="Telemetry">Telemetry</SelectItem>
                      <SelectItem value="Parachute">Parachute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
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
                <div className="space-y-2">
                  <Label>Requested By</Label>
                  <Input
                    value={formData.requestedBy}
                    onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority Quadrant</Label>
                  <Select value={formData.eisenhowerQuadrant} onValueChange={(value) => setFormData({...formData, eisenhowerQuadrant: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="important-urgent">Important & Urgent</SelectItem>
                      <SelectItem value="important-not-urgent">Important & Not Urgent</SelectItem>
                      <SelectItem value="not-important-urgent">Not Important & Urgent</SelectItem>
                      <SelectItem value="not-important-not-urgent">Not Important & Not Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional details about this request..."
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addRequestMutation.isPending}>
                  {addRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests</CardTitle>
          <CardDescription>Review and manage team purchase requests</CardDescription>
        </CardHeader>
        <CardContent>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.itemName}</div>
                      <div className="text-sm text-muted-foreground">{request.vendor}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.team}</Badge>
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>{request.quantity}</TableCell>
                  <TableCell>${request.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>${(request.unitPrice * request.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getUrgencyColor(request.urgency) as any}>
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.requestedDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseRequests;