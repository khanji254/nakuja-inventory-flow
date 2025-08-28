import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Grid3X3, Users, Calendar, BarChart3, CheckSquare, Download, Trash2, RotateCcw, Lock } from 'lucide-react';
import TeamManagement from '@/components/team/TeamManagement';
import GanttChart from '@/components/gantt/GanttChart';
import TaskAllocation from '@/components/tasks/TaskAllocation';
import NotionTaskStatus from '@/components/tasks/NotionTaskStatus';
import PDFExport from '@/components/export/PDFExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';
import useTeamManagement from '@/hooks/useTeamManagement';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { User, usePermissions } from '@/lib/permissions';

interface MatrixTask {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  deadline: Date;
  estimatedHours: number;
}

interface MatrixTasks {
  'important-urgent': MatrixTask[];
  'important-not-urgent': MatrixTask[];
  'not-important-urgent': MatrixTask[];
  'not-important-not-urgent': MatrixTask[];
}

const TeamManagementPage = () => {
  const permissions = usePermissions();
  const { tasks: teamTasks, addTask, setTasks: setTeamTasks, teamMembers } = useTeamManagement();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState('matrix');
  
  const [matrixTasks, setMatrixTasks] = useState<MatrixTasks>({
    'important-urgent': [
      { id: '1', title: 'Fix critical system bug', description: 'Address the memory leak in the telemetry system', assigneeId: '', deadline: new Date(), estimatedHours: 8 },
      { id: '2', title: 'Launch preparation', description: 'Complete final system checks before launch', assigneeId: '', deadline: new Date(), estimatedHours: 16 }
    ],
    'important-not-urgent': [
      { id: '3', title: 'Update inventory tracking system', description: 'Implement barcode scanning for better accuracy', assigneeId: '', deadline: addDays(new Date(), 7), estimatedHours: 24 },
      { id: '4', title: 'Team training program', description: 'Develop training materials for new team members', assigneeId: '', deadline: addDays(new Date(), 14), estimatedHours: 12 }
    ],
    'not-important-urgent': [
      { id: '5', title: 'Respond to emails', description: 'Clear backlog of non-critical correspondence', assigneeId: '', deadline: new Date(), estimatedHours: 2 },
      { id: '6', title: 'Update documentation', description: 'Ensure all technical docs are current', assigneeId: '', deadline: addDays(new Date(), 3), estimatedHours: 4 }
    ],
    'not-important-not-urgent': [
      { id: '7', title: 'Organize workspace', description: 'Clean and organize the lab space', assigneeId: '', deadline: addDays(new Date(), 30), estimatedHours: 3 },
      { id: '8', title: 'Research new technologies', description: 'Investigate emerging rocket technologies', assigneeId: '', deadline: addDays(new Date(), 21), estimatedHours: 8 }
    ]
  });

  // Filter tasks based on user permissions - members only see their own tasks
  const getFilteredMatrixTasks = (): MatrixTasks => {
    if (permissions.canEditTeam(user.teamId || '') || permissions.hasPermission('READ_ALL')) {
      return matrixTasks; // Team leads, supervisors, admins see all tasks
    }
    
    // Members only see tasks assigned to them or unassigned tasks
    const filtered: MatrixTasks = {
      'important-urgent': matrixTasks['important-urgent'].filter(task => task.assigneeId === user.id || task.assigneeId === ''),
      'important-not-urgent': matrixTasks['important-not-urgent'].filter(task => task.assigneeId === user.id || task.assigneeId === ''),
      'not-important-urgent': matrixTasks['not-important-urgent'].filter(task => task.assigneeId === user.id || task.assigneeId === ''),
      'not-important-not-urgent': matrixTasks['not-important-not-urgent'].filter(task => task.assigneeId === user.id || task.assigneeId === '')
    };
    return filtered;
  };

  const filteredMatrixTasks = getFilteredMatrixTasks();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    quadrant: 'important-urgent' as keyof typeof matrixTasks,
    assigneeId: '',
    deadline: new Date(),
    estimatedHours: 1
  });

  const addNewTask = () => {
    if (!newTask.title || !newTask.assigneeId) return;
    
    const matrixTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      assigneeId: newTask.assigneeId,
      deadline: newTask.deadline,
      estimatedHours: newTask.estimatedHours
    };

    // Add to matrix
    setMatrixTasks(prev => ({
      ...prev,
      [newTask.quadrant]: [...prev[newTask.quadrant], matrixTask]
    }));

    // Add to team management system
    addTask({
      title: newTask.title,
      description: newTask.description,
      assigneeId: newTask.assigneeId,
      status: 'not-started',
      priority: getPriorityFromQuadrant(newTask.quadrant),
      estimatedHours: newTask.estimatedHours,
      startDate: new Date(),
      endDate: newTask.deadline,
      category: 'project',
      quadrant: newTask.quadrant
    });

    setNewTask({
      title: '',
      description: '',
      quadrant: 'important-urgent',
      assigneeId: '',
      deadline: new Date(),
      estimatedHours: 1
    });
    setIsAddTaskOpen(false);
  };

  const removeTask = (quadrant: keyof typeof matrixTasks, taskId: string) => {
    setMatrixTasks(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter(task => task.id !== taskId)
    }));
  };

  const clearQuadrant = (quadrant: keyof typeof matrixTasks) => {
    setMatrixTasks(prev => ({
      ...prev,
      [quadrant]: []
    }));
  };

  const exportGanttChart = async () => {
    const ganttElement = document.getElementById('gantt-chart');
    if (!ganttElement) {
      console.error('Gantt chart element not found');
      return;
    }

    try {
      const canvas = await html2canvas(ganttElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 270;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 30;

      // Add header
      pdf.setFontSize(16);
      pdf.text('Weekly Gantt Chart', 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Week: ${format(startOfWeek(currentWeek), 'MMM dd')} - ${format(endOfWeek(currentWeek), 'MMM dd, yyyy')}`, 15, 22);
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 27);

      // Add image
      pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`gantt-chart-week-${format(currentWeek, 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting Gantt chart:', error);
    }
  };

  const exportMultipleWeeks = async (weeksCount: number = 4) => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    let isFirstPage = true;

    // Add title page
    pdf.setFontSize(20);
    pdf.text('Multi-Week Gantt Chart Report', 15, 20);
    pdf.setFontSize(12);
    pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 30);
    pdf.text(`Covering ${weeksCount} weeks starting from ${format(startOfWeek(currentWeek), 'MMM dd, yyyy')}`, 15, 40);

    for (let i = 0; i < weeksCount; i++) {
      const weekDate = addDays(currentWeek, i * 7);
      
      if (!isFirstPage) {
        pdf.addPage();
      } else {
        isFirstPage = false;
      }

      // Add week header
      pdf.setFontSize(14);
      pdf.text(`Week ${i + 1}: ${format(startOfWeek(weekDate), 'MMM dd')} - ${format(endOfWeek(weekDate), 'MMM dd, yyyy')}`, 15, isFirstPage ? 60 : 20);

      // Note: In a real implementation, you would capture the gantt chart for each week
      // For now, we'll just add the current week's chart as an example
      const ganttElement = document.getElementById('gantt-chart');
      if (ganttElement) {
        try {
          const canvas = await html2canvas(ganttElement, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 250;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 15, isFirstPage ? 70 : 30, imgWidth, Math.min(imgHeight, 150));
        } catch (error) {
          console.error(`Error capturing week ${i + 1}:`, error);
        }
      }
    }

    pdf.save(`gantt-chart-${weeksCount}-weeks-${format(currentWeek, 'yyyy-MM-dd')}.pdf`);
  };

  const getPriorityFromQuadrant = (quadrant: string) => {
    switch (quadrant) {
      case 'important-urgent': return 'urgent' as const;
      case 'important-not-urgent': return 'high' as const;
      case 'not-important-urgent': return 'medium' as const;
      default: return 'low' as const;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 30 : -30));
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {permissions.canEditTeam(user.teamId || '') ? 'Team Management' : 'Task Management'}
            </h1>
            <p className="text-muted-foreground">
              {permissions.canEditTeam(user.teamId || '') 
                ? 'Manage team, tasks, and project timeline' 
                : 'View your tasks and project status. Create purchase requests from the Purchase Requests page.'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigateWeek('prev')} variant="outline" size="sm">
              Previous {viewMode}
            </Button>
            <Button onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')} variant="outline" size="sm">
              {viewMode === 'week' ? 'Month View' : 'Week View'}
            </Button>
            <Button onClick={() => navigateWeek('next')} variant="outline" size="sm">
              Next {viewMode}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${permissions.canEditTeam(user.teamId || '') ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="matrix">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Matrix
            </TabsTrigger>
            {permissions.canEditTeam(user.teamId || '') && (
              <TabsTrigger value="team">
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
            )}
            <TabsTrigger value="gantt">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="status">
              <CheckSquare className="w-4 h-4 mr-2" />
              Status
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matrix" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Eisenhower Matrix</CardTitle>
                    <CardDescription>
                      Organize tasks by importance and urgency to prioritize effectively
                    </CardDescription>
                  </div>
                  {permissions.canEditTeam(user.teamId || '') && (
                    <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={newTask.title}
                            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Task title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newTask.description}
                            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Task description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quadrant</Label>
                          <Select value={newTask.quadrant} onValueChange={(value: keyof typeof matrixTasks) => setNewTask(prev => ({ ...prev, quadrant: value }))}>
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
                        <div className="space-y-2">
                          <Label>Assign to</Label>
                          <Select value={newTask.assigneeId} onValueChange={(value) => setNewTask(prev => ({ ...prev, assigneeId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name} - {member.team}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Deadline</Label>
                            <Input
                              type="datetime-local"
                              value={format(newTask.deadline, "yyyy-MM-dd'T'HH:mm")}
                              onChange={(e) => setNewTask(prev => ({ ...prev, deadline: new Date(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Estimated Hours</Label>
                            <Input
                              type="number"
                              value={newTask.estimatedHours}
                              onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 1 }))}
                              min="1"
                            />
                          </div>
                        </div>
                        <Button onClick={addNewTask} className="w-full">Add Task</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  )}
                  {!permissions.canEditTeam(user.teamId || '') && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">View Only Mode</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div id="eisenhower-matrix" className="grid grid-cols-2 gap-6 h-[600px]">
                  {/* Important & Urgent */}
                  <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-red-700">Important & Urgent</h3>
                      <div className="flex gap-2">
                        <Badge variant="destructive">Do First</Badge>
                        <Button size="sm" variant="outline" onClick={() => clearQuadrant('important-urgent')}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredMatrixTasks['important-urgent'].map((task) => (
                        <div key={task.id} className="bg-white p-3 rounded border group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              {task.assigneeId && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Assigned to: {teamMembers.find(m => m.id === task.assigneeId)?.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">Due: {format(task.deadline, 'MMM dd, yyyy')}</p>
                            </div>
                            {permissions.canEditTeam(user.teamId || '') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTask('important-urgent', task.id)}
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Important & Not Urgent */}
                  <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-yellow-700">Important & Not Urgent</h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Schedule</Badge>
                        <Button size="sm" variant="outline" onClick={() => clearQuadrant('important-not-urgent')}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredMatrixTasks['important-not-urgent'].map((task) => (
                        <div key={task.id} className="bg-white p-3 rounded border group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              {task.assigneeId && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Assigned to: {teamMembers.find(m => m.id === task.assigneeId)?.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">Due: {format(task.deadline, 'MMM dd, yyyy')}</p>
                            </div>
                            {permissions.canEditTeam(user.teamId || '') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTask('important-not-urgent', task.id)}
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Not Important & Urgent */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-blue-700">Not Important & Urgent</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">Delegate</Badge>
                        <Button size="sm" variant="outline" onClick={() => clearQuadrant('not-important-urgent')}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredMatrixTasks['not-important-urgent'].map((task) => (
                        <div key={task.id} className="bg-white p-3 rounded border group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              {task.assigneeId && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Assigned to: {teamMembers.find(m => m.id === task.assigneeId)?.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">Due: {format(task.deadline, 'MMM dd, yyyy')}</p>
                            </div>
                            {permissions.canEditTeam(user.teamId || '') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTask('not-important-urgent', task.id)}
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Not Important & Not Urgent */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-700">Not Important & Not Urgent</h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Eliminate</Badge>
                        <Button size="sm" variant="outline" onClick={() => clearQuadrant('not-important-not-urgent')}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredMatrixTasks['not-important-not-urgent'].map((task) => (
                        <div key={task.id} className="bg-white p-3 rounded border group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                              {task.assigneeId && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Assigned to: {teamMembers.find(m => m.id === task.assigneeId)?.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">Due: {format(task.deadline, 'MMM dd, yyyy')}</p>
                            </div>
                            {permissions.canEditTeam(user.teamId || '') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTask('not-important-not-urgent', task.id)}
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {permissions.canEditTeam(user.teamId || '') && (
            <TabsContent value="team" className="space-y-6">
              <TeamManagement />
            </TabsContent>
          )}

          <TabsContent value="gantt" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Project Timeline - {viewMode === 'week' ? 'Weekly' : 'Monthly'} View</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(startOfWeek(currentWeek), 'MMM dd')} - {format(endOfWeek(currentWeek), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={exportGanttChart}>
                        Current Week
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportMultipleWeeks(2)}>
                        Next 2 Weeks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportMultipleWeeks(4)}>
                        Next 4 Weeks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportMultipleWeeks(8)}>
                        Next 8 Weeks
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentWeek(new Date())}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                  >
                    Next
                    <RotateCcw className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                  const date = addDays(startOfWeek(currentWeek), index);
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
                  const dayTasks = teamTasks.filter(task => 
                    format(task.startDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ||
                    format(task.endDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );
                  
                  return (
                    <Button
                      key={day}
                      variant={isSelected ? "default" : "outline"}
                      className="h-20 flex flex-col p-2"
                      onClick={() => setSelectedDay(date)}
                    >
                      <div className="text-xs font-medium">{day}</div>
                      <div className="text-lg font-bold">{format(date, 'd')}</div>
                      <div className="text-xs text-muted-foreground">{dayTasks.length} tasks</div>
                    </Button>
                  );
                })}
              </div>

              <GanttChart weekStart={currentWeek} onExportPDF={exportGanttChart} />
              
              {/* Day Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasks for {format(selectedDay, 'EEEE, MMM dd, yyyy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamTasks
                      .filter(task => 
                        format(task.startDate, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd') ||
                        format(task.endDate, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
                      )
                      .map((task) => {
                        const assignee = teamMembers.find(m => m.id === task.assigneeId);
                        return (
                          <div key={task.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary">{task.status}</Badge>
                                  <Badge variant="outline">{task.priority}</Badge>
                                  {assignee && (
                                    <Badge variant="outline">{assignee.name}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <div>{task.estimatedHours}h estimated</div>
                                {task.actualHours && <div>{task.actualHours}h actual</div>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {teamTasks.filter(task => 
                      format(task.startDate, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd') ||
                      format(task.endDate, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd')
                    ).length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No tasks scheduled for this day
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskAllocation />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <NotionTaskStatus />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <PDFExport onTabChange={setActiveTab} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamManagementPage;