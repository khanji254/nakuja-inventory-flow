import { useState } from 'react';
import { Plus, ArrowRight, Clock, AlertTriangle, CheckCircle2, X, Users, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePurchaseRequests } from '@/hooks/usePurchaseRequests';
import { useInventoryData } from '@/hooks/useInventoryData';
import TeamManagement from '@/components/team/TeamManagement';
import GanttChart from '@/components/gantt/GanttChart';
import TaskAllocation from '@/components/tasks/TaskAllocation';
import NotionTaskStatus from '@/components/tasks/NotionTaskStatus';
import PDFExport from '@/components/export/PDFExport';

const EisenhowerMatrix = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: purchaseRequests = [] } = usePurchaseRequests();
  const { data: inventory = [] } = useInventoryData();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'task',
    category: 'inventory',
    priority: 'medium',
    team: 'Recovery'
  });

  // Custom tasks for inventory management and rocket project
  const [customTasks] = useState([
    {
      id: 'inv-1',
      title: 'Update inventory tracking system',
      description: 'Implement barcode scanning for better accuracy',
      type: 'task',
      category: 'inventory',
      quadrant: 'important-not-urgent',
      team: 'Recovery'
    },
    {
      id: 'inv-2',
      title: 'Low stock alert: Deployment bags',
      description: 'Only 2 deployment bags remaining in inventory',
      type: 'inventory',
      category: 'parachute',
      quadrant: 'important-urgent',
      team: 'Parachute'
    },
    {
      id: 'proj-1',
      title: 'Schedule test flight preparation',
      description: 'Coordinate with all teams for upcoming test',
      type: 'task',
      category: 'project',
      quadrant: 'important-urgent',
      team: 'Recovery'
    },
    {
      id: 'clean-1',
      title: 'Remove obsolete electronic components',
      description: 'Clean up old PCBs and unused sensors',
      type: 'cleanup',
      category: 'inventory',
      quadrant: 'not-important-not-urgent',
      team: 'Avionics'
    }
  ]);

  const quadrants = {
    'important-urgent': {
      title: 'Do First',
      subtitle: 'Important & Urgent',
      description: 'Critical items that need immediate attention',
      color: 'bg-red-50 border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    },
    'important-not-urgent': {
      title: 'Schedule',
      subtitle: 'Important & Not Urgent',
      description: 'Plan and prepare for these items',
      color: 'bg-blue-50 border-blue-200',
      icon: Clock,
      iconColor: 'text-blue-500'
    },
    'not-important-urgent': {
      title: 'Delegate',
      subtitle: 'Not Important & Urgent',
      description: 'Delegate or find efficient solutions',
      color: 'bg-yellow-50 border-yellow-200',
      icon: ArrowRight,
      iconColor: 'text-yellow-500'
    },
    'not-important-not-urgent': {
      title: 'Eliminate',
      subtitle: 'Not Important & Not Urgent',
      description: 'Consider removing or deprioritizing',
      color: 'bg-gray-50 border-gray-200',
      icon: X,
      iconColor: 'text-gray-500'
    }
  };

  const getItemsByQuadrant = (quadrant: string) => {
    const purchases = purchaseRequests.filter(req => req.eisenhowerQuadrant === quadrant);
    const tasks = customTasks.filter(task => task.quadrant === quadrant);
    
    // Add low stock items to urgent quadrants
    const lowStockItems = inventory
      .filter(item => item.quantity <= item.reorderPoint)
      .map(item => ({
        id: `stock-${item.id}`,
        title: `Low stock: ${item.name}`,
        description: `Only ${item.quantity} remaining (reorder at ${item.reorderPoint})`,
        type: 'stock-alert',
        category: 'inventory',
        team: item.location || 'Unknown'
      }));

    return [...purchases, ...tasks, ...(quadrant === 'important-urgent' ? lowStockItems : [])];
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'stock-alert': return '📦';
      case 'cleanup': return '🧹';
      case 'task': return '📋';
      case 'project': return '🚀';
      default: return '💰';
    }
  };

  const getItemBadgeColor = (type: string) => {
    switch (type) {
      case 'stock-alert': return 'destructive';
      case 'cleanup': return 'secondary';
      case 'task': return 'default';
      case 'project': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eisenhower Priority Matrix & Team Management</h1>
          <p className="text-muted-foreground">
            Prioritize tasks, manage teams, and track project timelines
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a custom task or action item to the priority matrix
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title..."
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTask.category} onValueChange={(value) => setNewTask({...newTask, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="admin">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Select value={newTask.team} onValueChange={(value) => setNewTask({...newTask, team: value})}>
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
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="matrix">Matrix</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="allocation">Tasks</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-6">
          {/* Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(quadrants).map(([key, quadrant]) => {
          const items = getItemsByQuadrant(key);
          const Icon = quadrant.icon;
          
          return (
            <Card key={key} className={`${quadrant.color} min-h-96`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${quadrant.iconColor}`} />
                  <div>
                    <CardTitle className="text-lg">{quadrant.title}</CardTitle>
                    <CardDescription className="font-medium">{quadrant.subtitle}</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{quadrant.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No items in this quadrant
                    </div>
                  ) : (
                    items.map((item) => (
                      <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{getItemIcon(item.type || 'task')}</span>
                                <Badge variant={getItemBadgeColor(item.type || 'task') as any} className="text-xs">
                                  {item.type || 'purchase'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.team}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm leading-tight mb-1">
                                {item.title || ('itemName' in item ? item.itemName : 'Unknown Item')}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {item.description || ('notes' in item ? item.notes : '') || 
                                 ('quantity' in item && 'unitPrice' in item ? `${item.quantity}x at $${item.unitPrice?.toFixed(2)}` : '')}
                              </p>
                              {'unitPrice' in item && item.unitPrice && (
                                <div className="mt-2 text-sm font-medium">
                                  ${(item.unitPrice * (('quantity' in item && item.quantity) || 1)).toFixed(2)}
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Matrix Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Summary</CardTitle>
          <CardDescription>Overview of tasks and items across all quadrants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(quadrants).map(([key, quadrant]) => {
              const itemCount = getItemsByQuadrant(key).length;
              const totalValue = getItemsByQuadrant(key)
                .filter(item => 'unitPrice' in item && item.unitPrice)
                .reduce((sum, item) => {
                  const price = 'unitPrice' in item ? item.unitPrice || 0 : 0;
                  const quantity = 'quantity' in item ? item.quantity || 1 : 1;
                  return sum + (price * quantity);
                }, 0);
              
              return (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold">{itemCount}</div>
                  <div className="text-sm text-muted-foreground">{quadrant.title}</div>
                  {totalValue > 0 && (
                    <div className="text-xs text-muted-foreground">${totalValue.toFixed(2)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="gantt" id="gantt-chart">
          <GanttChart />
        </TabsContent>

        <TabsContent value="allocation" id="task-allocation">
          <TaskAllocation />
        </TabsContent>

        <TabsContent value="status">
          <NotionTaskStatus />
        </TabsContent>

        <TabsContent value="export">
          <PDFExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EisenhowerMatrix;