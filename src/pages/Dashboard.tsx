import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, FileText, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInventoryData } from '@/hooks/useInventoryData';
import { usePurchaseRequests } from '@/hooks/usePurchaseRequests';
import { useBOMData } from '@/hooks/useBOMData';

const Dashboard = () => {
  const { data: inventoryData } = useInventoryData();
  const { data: purchaseData } = usePurchaseRequests();
  const { data: bomData } = useBOMData();

  const totalInventoryValue = inventoryData?.reduce((sum, item) => sum + (item.unitPrice * item.currentStock), 0) || 0;
  const lowStockItems = inventoryData?.filter(item => item.currentStock < (item.minStock || 10)).length || 0;
  const pendingRequests = purchaseData?.filter(req => req.status === 'pending').length || 0;
  const activeBOMs = bomData?.filter(bom => bom.status === 'active').length || 0;

  const metrics = [
    {
      title: 'Total Inventory Value',
      value: `$${totalInventoryValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Active BOMs',
      value: activeBOMs,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  const recentActivity = [
    { action: 'Low stock alert', item: 'Carbon Fiber Sheets', time: '2 hours ago', type: 'warning' },
    { action: 'Purchase approved', item: 'Avionics Components', time: '4 hours ago', type: 'success' },
    { action: 'BOM updated', item: 'Parachute System v2.1', time: '1 day ago', type: 'info' },
    { action: 'New request', item: 'Telemetry Sensors', time: '2 days ago', type: 'info' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your inventory overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avionics</span>
                <span>$15,000 / $20,000</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Telemetry</span>
                <span>$8,000 / $12,000</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Parachute</span>
                <span>$5,000 / $8,000</span>
              </div>
              <Progress value={63} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'warning' ? 'bg-orange-500' :
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.item}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;