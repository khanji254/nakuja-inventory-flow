import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Phone, Mail, Star, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  useVendors, 
  useAddVendor, 
  useUpdateVendor, 
  useDeleteVendor, 
  useToggleVendorStatus 
} from '@/hooks/useVendors';
import { Vendor, PaymentMethod, PaymentInfo } from '@/types';

const paymentMethodLabels: Record<PaymentMethod, string> = {
  'paybill': 'Paybill',
  'paybill-with-store': 'Paybill with Store Number',
  'till-number': 'Till Number',
  'pochi-la-biashara': 'Pochi La Biashara',
  'send-money': 'Send Money',
  'bank-transfer': 'Bank Transfer',
  'cash': 'Cash',
  'credit-card': 'Credit Card'
};

const PaymentMethodBadge: React.FC<{ method: PaymentInfo }> = ({ method }) => {
  const getVariant = (methodType: PaymentMethod) => {
    switch (methodType) {
      case 'paybill':
      case 'paybill-with-store':
        return 'default';
      case 'till-number':
      case 'pochi-la-biashara':
      case 'send-money':
        return 'secondary';
      case 'bank-transfer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getVariant(method.method) as any} className="text-xs">
      {paymentMethodLabels[method.method]}
    </Badge>
  );
};

const VendorFormDialog: React.FC<{
  vendor?: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ vendor, open, onOpenChange }) => {
  const { toast } = useToast();
  const addVendorMutation = useAddVendor();
  const updateVendorMutation = useUpdateVendor();
  
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: vendor?.name || '',
    companyName: vendor?.companyName || '',
    contactPerson: vendor?.contactPerson || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    alternativePhone: vendor?.alternativePhone || '',
    location: {
      address: vendor?.location?.address || '',
      city: vendor?.location?.city || '',
      region: vendor?.location?.region || '',
      country: vendor?.location?.country || 'Kenya',
    },
    paymentMethods: vendor?.paymentMethods || [{ method: 'paybill', details: '', accountName: '' }],
    category: vendor?.category || '',
    rating: vendor?.rating || 0,
    notes: vendor?.notes || '',
    website: vendor?.website || '',
    registrationNumber: vendor?.registrationNumber || '',
    taxNumber: vendor?.taxNumber || '',
    isActive: vendor?.isActive ?? true,
    createdBy: 'Current User'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vendorData = {
      ...formData,
      location: {
        ...formData.location!,
        coordinates: formData.location?.coordinates
      },
      paymentMethods: formData.paymentMethods!.filter(pm => pm.details.trim() !== '')
    } as Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>;

    if (vendor) {
      updateVendorMutation.mutate({ ...vendor, ...vendorData } as Vendor, {
        onSuccess: () => {
          toast({ title: 'Vendor updated successfully' });
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: 'Error updating vendor', variant: 'destructive' });
        }
      });
    } else {
      addVendorMutation.mutate(vendorData, {
        onSuccess: () => {
          toast({ title: 'Vendor added successfully' });
          onOpenChange(false);
          // Reset form
          setFormData({
            name: '',
            companyName: '',
            contactPerson: '',
            email: '',
            phone: '',
            alternativePhone: '',
            location: { address: '', city: '', region: '', country: 'Kenya' },
            paymentMethods: [{ method: 'paybill', details: '', accountName: '' }],
            category: '',
            rating: 0,
            notes: '',
            website: '',
            registrationNumber: '',
            taxNumber: '',
            isActive: true,
            createdBy: 'Current User'
          });
        },
        onError: () => {
          toast({ title: 'Error adding vendor', variant: 'destructive' });
        }
      });
    }
  };

  const addPaymentMethod = () => {
    setFormData({
      ...formData,
      paymentMethods: [
        ...formData.paymentMethods!,
        { method: 'paybill', details: '', accountName: '' }
      ]
    });
  };

  const removePaymentMethod = (index: number) => {
    setFormData({
      ...formData,
      paymentMethods: formData.paymentMethods!.filter((_, i) => i !== index)
    });
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentInfo, value: string) => {
    const updated = [...formData.paymentMethods!];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, paymentMethods: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {vendor ? 'Update vendor information' : 'Enter vendor details to add them to your system'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Materials">Materials</SelectItem>
                    <SelectItem value="Recovery Systems">Recovery Systems</SelectItem>
                    <SelectItem value="Navigation">Navigation</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+254 7XX XXX XXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Alternative Phone</Label>
                <Input
                  value={formData.alternativePhone}
                  onChange={(e) => setFormData({...formData, alternativePhone: e.target.value})}
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={formData.location?.address}
                  onChange={(e) => setFormData({
                    ...formData, 
                    location: {...formData.location!, address: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={formData.location?.city}
                  onChange={(e) => setFormData({
                    ...formData, 
                    location: {...formData.location!, city: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Region/County</Label>
                <Input
                  value={formData.location?.region}
                  onChange={(e) => setFormData({
                    ...formData, 
                    location: {...formData.location!, region: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={formData.location?.country}
                  onChange={(e) => setFormData({
                    ...formData, 
                    location: {...formData.location!, country: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Payment Methods</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPaymentMethod}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
            
            {formData.paymentMethods?.map((payment, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Payment Method {index + 1}</Label>
                  {formData.paymentMethods!.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removePaymentMethod(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select 
                    value={payment.method} 
                    onValueChange={(value) => updatePaymentMethod(index, 'method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentMethodLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Details (Number/Account)"
                    value={payment.details}
                    onChange={(e) => updatePaymentMethod(index, 'details', e.target.value)}
                  />
                  
                  <Input
                    placeholder="Account Name"
                    value={payment.accountName || ''}
                    onChange={(e) => updatePaymentMethod(index, 'accountName', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Number</Label>
                <Input
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes about this vendor..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addVendorMutation.isPending || updateVendorMutation.isPending}
            >
              {vendor ? 'Update Vendor' : 'Add Vendor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>();
  
  const { data: vendors = [], isLoading } = useVendors();
  const deleteVendorMutation = useDeleteVendor();
  const toggleStatusMutation = useToggleVendorStatus();
  const { toast } = useToast();

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && vendor.isActive) ||
                         (statusFilter === 'inactive' && !vendor.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsDialogOpen(true);
  };

  const handleDelete = (vendorId: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteVendorMutation.mutate(vendorId, {
        onSuccess: () => {
          toast({ title: 'Vendor deleted successfully' });
        },
        onError: () => {
          toast({ title: 'Error deleting vendor', variant: 'destructive' });
        }
      });
    }
  };

  const handleToggleStatus = (vendorId: string) => {
    toggleStatusMutation.mutate(vendorId, {
      onSuccess: () => {
        toast({ title: 'Vendor status updated' });
      },
      onError: () => {
        toast({ title: 'Error updating vendor status', variant: 'destructive' });
      }
    });
  };

  const activeVendors = vendors.filter(v => v.isActive).length;
  const categories = [...new Set(vendors.map(v => v.category).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">Manage vendor information and payment methods</p>
        </div>
        <Button onClick={() => {
          setEditingVendor(undefined);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVendors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.length > 0 
                ? (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors List</CardTitle>
          <CardDescription>View and manage all vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category!}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Payment Methods</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading vendors...
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">{vendor.companyName}</div>
                        {vendor.contactPerson && (
                          <div className="text-xs text-muted-foreground">Contact: {vendor.contactPerson}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {vendor.phone}
                        </div>
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 text-sm">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div>{vendor.location.city}</div>
                          <div className="text-xs text-muted-foreground">{vendor.location.country}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.paymentMethods.slice(0, 2).map((method, index) => (
                          <PaymentMethodBadge key={index} method={method} />
                        ))}
                        {vendor.paymentMethods.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{vendor.paymentMethods.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vendor.category && (
                        <Badge variant="outline">{vendor.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {vendor.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{vendor.rating}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(vendor.id)}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {vendor.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(vendor.id)}
                          disabled={deleteVendorMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <VendorFormDialog
        vendor={editingVendor}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingVendor(undefined);
        }}
      />
    </div>
  );
};

export default Vendors;
