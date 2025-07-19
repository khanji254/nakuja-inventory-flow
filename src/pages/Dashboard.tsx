import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, FileText, AlertTriangle, TrendingUp, DollarSign, Users, MapPin, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInventoryData } from '@/hooks/useInventoryData';
import { usePurchaseRequests, usePurchaseLists } from '@/hooks/usePurchaseRequests';
import { useBOMData } from '@/hooks/useBOMData';
import { useVendors } from '@/hooks/useVendors';
import { useNotifications } from '@/hooks/useNotifications';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SystemConfig } from '@/lib/system-config';

const Dashboard = () => {
  const { data: inventoryData = [] } = useInventoryData();
  const { data: purchaseData = [] } = usePurchaseRequests();
  const { data: purchaseLists = [] } = usePurchaseLists();
  const { data: bomData = [] } = useBOMData();
  const { data: vendors = [] } = useVendors();
  const { data: notifications = [] } = useNotifications();

  // Enhanced Analytics
  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + (item.unitPrice * item.currentStock), 0);
  const lowStockItems = inventoryData.filter(item => item.currentStock < (item.minStock || 10));
  const pendingRequests = purchaseData.filter(req => req.status === 'pending');
  const approvedRequests = purchaseData.filter(req => req.status === 'approved');
  const completedRequests = purchaseData.filter(req => req.status === 'completed');
  const activeBOMs = bomData.filter(bom => bom.status === 'active');
  
  // Team Analytics
  const teamStats = SystemConfig.teams.map(team => {
    const teamInventory = inventoryData.filter(item => item.category?.includes(team) || item.description?.includes(team));
    const teamRequests = purchaseData.filter(req => req.team === team);
    const teamBOMs = bomData.filter(bom => bom.team === team);
    
    return {
      name: team,
      inventoryCount: teamInventory.length,
      inventoryValue: teamInventory.reduce((sum, item) => sum + (item.unitPrice * item.currentStock), 0),
      pendingRequests: teamRequests.filter(req => req.status === 'pending').length,
      approvedRequests: teamRequests.filter(req => req.status === 'approved').length,
      activeBOMs: teamBOMs.filter(bom => bom.status === 'active').length
    };
  });

  // Location Analytics
  const locationStats = inventoryData.reduce((acc, item) => {
    const location = item.location || 'Unassigned';
    if (!acc[location]) {
      acc[location] = { itemCount: 0, totalValue: 0, lowStockCount: 0 };
    }
    acc[location].itemCount++;
    acc[location].totalValue += item.unitPrice * item.currentStock;
    if (item.currentStock < (item.minStock || 10)) {
      acc[location].lowStockCount++;
    }
    return acc;
  }, {} as Record<string, { itemCount: number; totalValue: number; lowStockCount: number }>);

  // Category Analytics
  const categoryStats = inventoryData.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { itemCount: 0, totalValue: 0, lowStockCount: 0 };
    }
    acc[category].itemCount++;
    acc[category].totalValue += item.unitPrice * item.currentStock;
    if (item.currentStock < (item.minStock || 10)) {
      acc[category].lowStockCount++;
    }
    return acc;
  }, {} as Record<string, { itemCount: number; totalValue: number; lowStockCount: number }>);

  // Purchase Flow Analytics
  const purchaseFlow = {
    totalRequests: purchaseData.length,
    pendingCount: pendingRequests.length,
    approvedCount: approvedRequests.length,
    completedCount: completedRequests.length,
    totalLists: purchaseLists.length,
    activeLists: purchaseLists.filter(list => list.status !== 'completed').length
  };

  // Critical Notifications
  const criticalNotifications = [
    ...lowStockItems.slice(0, 3).map(item => ({
      type: 'warning' as const,
      title: 'Low Stock Alert',
      message: `${item.name} is running low (${item.currentStock} remaining)`,
      location: item.location || 'Unknown location'
    })),
    ...pendingRequests.slice(0, 2).map(req => ({
      type: 'info' as const,
      title: 'Pending Approval',
      message: `${req.itemName} request from ${req.team} team`,
      urgency: req.urgency
    }))
  ];

  const metrics = [
    {
      title: 'Total Inventory Value',
      value: `KSh ${totalInventoryValue.toLocaleString()}`,
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Active Items',
      value: inventoryData.length,
      change: '+5',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Purchase Requests',
      value: purchaseFlow.totalRequests,
      change: `${pendingRequests.length} pending`,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Active BOMs',
      value: activeBOMs.length,
      change: `${bomData.length} total`,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      change: 'Needs attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      title: 'Storage Locations',
      value: Object.keys(locationStats).length,
      change: 'Across facility',
      icon: MapPin,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Operations Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive overview of inventory, purchases, and team analytics</p>
      </div>

      {/* Critical Notifications Bar */}
      {criticalNotifications.length > 0 && (
        <div className="space-y-2">
          {criticalNotifications.map((notification, index) => (
            <Alert key={index} className={notification.type === 'warning' ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{notification.title}:</strong> {notification.message}
                {'location' in notification && notification.location && <span className="text-sm text-muted-foreground ml-2">📍 {notification.location}</span>}
                {'urgency' in notification && notification.urgency && <Badge variant="outline" className="ml-2">{notification.urgency}</Badge>}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-full ${metric.bg}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="flow">Purchase Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
                    <div className="text-sm text-green-700">Completed Orders</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{approvedRequests.length}</div>
                    <div className="text-sm text-blue-700">Ready to Order</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Inventory Health</span>
                    <span>{Math.round(((inventoryData.length - lowStockItems.length) / inventoryData.length) * 100)}%</span>
                  </div>
                  <Progress value={((inventoryData.length - lowStockItems.length) / inventoryData.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>BOM Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bomData.slice(0, 5).map((bom) => (
                    <div key={bom.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{bom.name || bom.itemName}</div>
                        <div className="text-sm text-muted-foreground">{bom.team} • {bom.category || 'General'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">KSh {bom.totalCost?.toLocaleString() || (bom.unitPrice * bom.requiredQuantity).toLocaleString()}</div>
                        <Badge variant={bom.status === 'active' ? 'default' : 'secondary'}>
                          {bom.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Inventory Items</TableHead>
                    <TableHead>Inventory Value</TableHead>
                    <TableHead>Pending Requests</TableHead>
                    <TableHead>Approved Requests</TableHead>
                    <TableHead>Active BOMs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamStats.map((team) => (
                    <TableRow key={team.name}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.inventoryCount}</TableCell>
                      <TableCell>KSh {team.inventoryValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={team.pendingRequests > 0 ? 'destructive' : 'secondary'}>
                          {team.pendingRequests}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={team.approvedRequests > 0 ? 'default' : 'secondary'}>
                          {team.approvedRequests}
                        </Badge>
                      </TableCell>
                      <TableCell>{team.activeBOMs}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Storage Location Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(locationStats).map(([location, stats]) => (
                  <Card key={location}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{location}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Items:</span>
                        <span className="font-medium">{stats.itemCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Value:</span>
                        <span className="font-medium">KSh {stats.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Low Stock:</span>
                        <Badge variant={stats.lowStockCount > 0 ? 'destructive' : 'secondary'}>
                          {stats.lowStockCount}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryStats).map(([category, stats]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Items:</span>
                        <span className="font-medium">{stats.itemCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Value:</span>
                        <span className="font-medium">KSh {stats.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Low Stock:</span>
                        <Badge variant={stats.lowStockCount > 0 ? 'destructive' : 'secondary'}>
                          {stats.lowStockCount}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Purchase Flow Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{purchaseFlow.totalRequests}</div>
                  <div className="text-sm text-blue-700">Total Requests</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">{purchaseFlow.pendingCount}</div>
                  <div className="text-sm text-yellow-700">Pending Approval</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{purchaseFlow.approvedCount}</div>
                  <div className="text-sm text-green-700">Ready to Order</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{purchaseFlow.completedCount}</div>
                  <div className="text-sm text-purple-700">Completed</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Purchase Lists Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{purchaseFlow.totalLists}</div>
                      <div className="text-sm text-muted-foreground">Total Lists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{purchaseFlow.activeLists}</div>
                      <div className="text-sm text-muted-foreground">Active Lists</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Rate</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Request to Approval Rate</span>
                      <span>{purchaseFlow.totalRequests > 0 ? Math.round((purchaseFlow.approvedCount / purchaseFlow.totalRequests) * 100) : 0}%</span>
                    </div>
                    <Progress value={purchaseFlow.totalRequests > 0 ? (purchaseFlow.approvedCount / purchaseFlow.totalRequests) * 100 : 0} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;