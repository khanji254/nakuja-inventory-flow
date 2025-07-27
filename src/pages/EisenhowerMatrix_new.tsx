import React, { useState, useEffect } from 'react';
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
import { Task, MatrixTasks, TaskPriority, TaskStatus } from '@/types';
import { taskService } from '@/lib/task-service';

interface TeamManagementPageProps {
  user: User;
}

const TeamManagementPage = ({ user }: TeamManagementPageProps) => {
  const permissions = usePermissions(user);
  const { tasks: teamTasks, addTask, setTasks: setTeamTasks, teamMembers } = useTeamManagement();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState('matrix');
  const [matrixTasks, setMatrixTasks] = useState<MatrixTasks>({
    'important-urgent': [],
    'important-not-urgent': [],
    'not-important-urgent': [],
    'not-important-not-urgent': []
  });
  
  // Load tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await taskService.getFilteredMatrixTasks(user as any);
        setMatrixTasks(tasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    loadTasks();
  }, [user]);

  // Task management states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    quadrant: 'important-urgent' as TaskPriority,
    assigneeId: '',
    deadline: new Date(),
    estimatedHours: 1
  });

  const addNewTask = async () => {
    if (!newTask.title || !newTask.assigneeId) return;
    
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        assigneeId: newTask.assigneeId,
        deadline: newTask.deadline,
        estimatedHours: newTask.estimatedHours,
        priority: newTask.quadrant,
        status: 'not-started' as TaskStatus,
        progress: 0,
        category: 'other' as const,
        createdBy: user.id,
        teamId: user.teamId
      };

      await taskService.createTask(taskData);
      
      // Reload tasks
      const updatedTasks = await taskService.getFilteredMatrixTasks(user as any);
      setMatrixTasks(updatedTasks);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        quadrant: 'important-urgent',
        assigneeId: '',
        deadline: new Date(),
        estimatedHours: 1
      });
      setIsAddTaskOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      // Reload tasks
      const updatedTasks = await taskService.getFilteredMatrixTasks(user as any);
      setMatrixTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getPriorityFromQuadrant = (quadrant: TaskPriority): string => {
    const priorities: { [key in TaskPriority]: string } = {
      'important-urgent': 'high',
      'important-not-urgent': 'medium',
      'not-important-urgent': 'medium', 
      'not-important-not-urgent': 'low'
    };
    return priorities[quadrant];
  };

  const clearQuadrant = async (quadrant: TaskPriority) => {
    const quadrantTasks = matrixTasks[quadrant];
    for (const task of quadrantTasks) {
      await taskService.deleteTask(task.id);
    }
    // Reload tasks
    const updatedTasks = await taskService.getFilteredMatrixTasks(user as any);
    setMatrixTasks(updatedTasks);
  };

  const exportGanttChart = async () => {
    const element = document.getElementById('gantt-chart');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.setFontSize(16);
      pdf.text('Gantt Chart - Task Timeline', 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 25);
      pdf.text(`Week: ${format(startOfWeek(currentWeek), 'MMM dd')} - ${format(endOfWeek(currentWeek), 'MMM dd, yyyy')}`, 15, 30);
      
      let yPosition = 40;
      if (imgHeight > pdfHeight - 50) {
        const ratio = (pdfHeight - 50) / imgHeight;
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth * ratio, (pdfHeight - 50));
      } else {
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      pdf.save(`gantt-chart-week-${format(currentWeek, 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const exportMultipleWeeks = async (weeksCount: number = 4) => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.setFontSize(16);
    pdf.text('Multi-Week Gantt Chart Export', 15, 15);
    pdf.setFontSize(12);
    pdf.text(`Project Timeline Overview`, 15, 25);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 35);
    pdf.text(`Covering ${weeksCount} weeks starting from ${format(startOfWeek(currentWeek), 'MMM dd, yyyy')}`, 15, 45);
    
    for (let i = 0; i < weeksCount; i++) {
      const weekDate = addDays(currentWeek, i * 7);
      setCurrentWeek(weekDate);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = document.getElementById('gantt-chart');
      if (element) {
        try {
          const canvas = await html2canvas(element, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          if (i > 0) pdf.addPage();
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pdfWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.setFontSize(12);
          pdf.text(`Week ${i + 1}: ${format(startOfWeek(weekDate), 'MMM dd')} - ${format(endOfWeek(weekDate), 'MMM dd, yyyy')}`, 15, 60);
          
          let yPosition = 70;
          if (imgHeight > pdfHeight - 80) {
            const ratio = (pdfHeight - 80) / imgHeight;
            pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth * ratio, (pdfHeight - 80));
          } else {
            pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
          }
        } catch (error) {
          console.error(`Error capturing week ${i + 1}:`, error);
        }
      }
    }
    
    pdf.save(`gantt-chart-${weeksCount}-weeks-${format(currentWeek, 'yyyy-MM-dd')}.pdf`);
    setCurrentWeek(new Date());
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 30 : -30));
  };

  const renderQuadrant = (
    title: string,
    description: string,
    tasks: Task[],
    quadrant: TaskPriority,
    colorClass: string
  ) => (
    <Card className={`${colorClass} h-[400px] flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {permissions.canEditTeam(user.teamId || '') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => clearQuadrant(quadrant)}>
                    Clear All Tasks
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="p-3 bg-white rounded-lg shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {task.assigneeName || 'Unassigned'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {task.estimatedHours}h
                    </span>
                    <span className="text-xs text-gray-500">
                      Due: {format(new Date(task.deadline), 'MMM dd')}
                    </span>
                    {task.progress > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {task.progress}%
                      </Badge>
                    )}
                  </div>
                </div>
                {permissions.canEditTeam(user.teamId || '') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Organize and prioritize tasks using the Eisenhower Matrix
          </p>
        </div>
        <div className="flex gap-2">
          <PDFExport />
          {permissions.canEditTeam(user.teamId || '') && (
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quadrant">Priority Quadrant</Label>
                    <Select value={newTask.quadrant} onValueChange={(value) => setNewTask({ ...newTask, quadrant: value as TaskPriority })}>
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
                  <div>
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select value={newTask.assigneeId} onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={newTask.deadline.toISOString().slice(0, 16)}
                      onChange={(e) => setNewTask({ ...newTask, deadline: new Date(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours">Estimated Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button onClick={addNewTask} className="w-full">
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {!permissions.canEditTeam(user.teamId || '') && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-sm">View Only</span>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Matrix View
          </TabsTrigger>
          {permissions.canEditTeam(user.teamId || '') && (
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Management
            </TabsTrigger>
          )}
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Gantt Chart
          </TabsTrigger>
          <TabsTrigger value="allocation" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Task Allocation
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Status Board
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {renderQuadrant(
              "Important & Urgent",
              "Do First - Critical tasks that need immediate attention",
              matrixTasks['important-urgent'],
              'important-urgent',
              "border-red-200 bg-red-50"
            )}
            {renderQuadrant(
              "Important & Not Urgent",
              "Schedule - Important tasks that can be planned",
              matrixTasks['important-not-urgent'],
              'important-not-urgent',
              "border-yellow-200 bg-yellow-50"
            )}
            {renderQuadrant(
              "Not Important & Urgent",
              "Delegate - Tasks that need to be done quickly but aren't critical",
              matrixTasks['not-important-urgent'],
              'not-important-urgent',
              "border-blue-200 bg-blue-50"
            )}
            {renderQuadrant(
              "Not Important & Not Urgent",
              "Eliminate - Tasks that can be removed or minimized",
              matrixTasks['not-important-not-urgent'],
              'not-important-not-urgent',
              "border-gray-200 bg-gray-50"
            )}
          </div>
        </TabsContent>

        {permissions.canEditTeam(user.teamId || '') && (
          <TabsContent value="team">
            <TeamManagement user={user} />
          </TabsContent>
        )}

        <TabsContent value="gantt">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Gantt Chart</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    Previous Week
                  </Button>
                  <span className="text-sm font-medium">
                    {format(startOfWeek(currentWeek), 'MMM dd')} - {format(endOfWeek(currentWeek), 'MMM dd, yyyy')}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    Next Week
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportGanttChart}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Current Week
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Multiple Weeks
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => exportMultipleWeeks(2)}>
                      Export 2 Weeks
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportMultipleWeeks(4)}>
                      Export 4 Weeks
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportMultipleWeeks(8)}>
                      Export 8 Weeks
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div id="gantt-chart">
              <GanttChart 
                tasks={teamTasks} 
                currentWeek={currentWeek}
                onWeekChange={setCurrentWeek}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="allocation">
          <TaskAllocation user={user} />
        </TabsContent>

        <TabsContent value="status">
          <NotionTaskStatus user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamManagementPage;
