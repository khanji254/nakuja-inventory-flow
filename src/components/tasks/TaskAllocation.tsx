import React, { useState } from 'react';
import { UserCheck, Clock, AlertCircle, CheckCircle2, Eye, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useTeamManagement, { Task } from '@/hooks/useTeamManagement';

const TaskAllocation: React.FC = () => {
  const { 
    tasks, 
    teamMembers, 
    assignTask, 
    updateTaskStatus, 
    getTasksByQuadrant,
    getMemberWorkload 
  } = useTeamManagement();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newNote, setNewNote] = useState('');
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'review': return <Eye className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const addNote = () => {
    if (selectedTask && newNote.trim()) {
      updateTaskStatus(selectedTask.id, selectedTask.status, newNote.trim());
      setNewNote('');
      // Update selected task with new note
      const updatedTask = tasks.find(t => t.id === selectedTask.id);
      if (updatedTask) setSelectedTask(updatedTask);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'assigned') return task.assigneeId;
    if (filter === 'unassigned') return !task.assigneeId;
    return true;
  });

  const quadrants = ['important-urgent', 'important-not-urgent', 'not-important-urgent', 'not-important-not-urgent'];

  return (
    <div className="space-y-6">
      {/* Task Allocation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              <div>
                <CardTitle>Task Allocation & Management</CardTitle>
                <CardDescription>Assign and track tasks across team members</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="by-quadrant" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-quadrant">By Priority</TabsTrigger>
          <TabsTrigger value="by-member">By Team Member</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="by-quadrant" className="space-y-4">
          {quadrants.map(quadrant => {
            const quadrantTasks = getTasksByQuadrant(quadrant).filter(task => {
              if (filter === 'assigned') return task.assigneeId;
              if (filter === 'unassigned') return !task.assigneeId;
              return true;
            });

            const quadrantNames = {
              'important-urgent': 'Do First (Urgent & Important)',
              'important-not-urgent': 'Schedule (Important & Not Urgent)',
              'not-important-urgent': 'Delegate (Urgent & Not Important)',
              'not-important-not-urgent': 'Eliminate (Not Urgent & Not Important)'
            };

            return (
              <Card key={quadrant}>
                <CardHeader>
                  <CardTitle className="text-lg">{quadrantNames[quadrant as keyof typeof quadrantNames]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quadrantTasks.map(task => {
                      const assignee = task.assigneeId ? teamMembers.find(m => m.id === task.assigneeId) : null;
                      
                      return (
                        <Card key={task.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Task Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(task.status)}
                                  <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                                    {task.priority}
                                  </Badge>
                                </div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedTask(task)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>{task.title}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">{task.description}</p>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Status</label>
                                          <Select 
                                            value={task.status} 
                                            onValueChange={(value: Task['status']) => updateTaskStatus(task.id, value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="not-started">Not Started</SelectItem>
                                              <SelectItem value="in-progress">In Progress</SelectItem>
                                              <SelectItem value="review">Review</SelectItem>
                                              <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        <div>
                                          <label className="text-sm font-medium">Assignee</label>
                                          <Select 
                                            value={task.assigneeId || ''} 
                                            onValueChange={(value) => assignTask(task.id, value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Unassigned" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {teamMembers.map(member => (
                                                <SelectItem key={member.id} value={member.id}>
                                                  {member.name} - {member.team}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>

                                      {/* Notes Section */}
                                      <div>
                                        <label className="text-sm font-medium">Notes & Updates</label>
                                        <div className="space-y-2 mt-2">
                                          {task.notes.map((note, index) => (
                                            <div key={index} className="text-sm p-2 bg-muted rounded border-l-2 border-primary">
                                              {note}
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="flex gap-2 mt-2">
                                          <Textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Add a note or update..."
                                            className="flex-1"
                                          />
                                          <Button onClick={addNote} size="sm">
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>

                              {/* Task Details */}
                              <div>
                                <h4 className="font-medium text-sm">{task.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                              </div>

                              {/* Assignee */}
                              <div className="flex items-center justify-between">
                                {assignee ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {getInitials(assignee.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">{assignee.name}</span>
                                  </div>
                                ) : (
                                  <Select onValueChange={(value) => assignTask(task.id, value)}>
                                    <SelectTrigger className="w-32 h-7">
                                      <SelectValue placeholder="Assign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {teamMembers.map(member => (
                                        <SelectItem key={member.id} value={member.id}>
                                          {member.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                
                                <div className="text-xs text-muted-foreground">
                                  {task.estimatedHours}h est.
                                </div>
                              </div>

                              {/* Progress */}
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {task.status === 'completed' ? '100%' : 
                                     task.status === 'review' ? '90%' :
                                     task.status === 'in-progress' ? '60%' : '0%'}
                                  </span>
                                </div>
                                <Progress 
                                  value={
                                    task.status === 'completed' ? 100 : 
                                    task.status === 'review' ? 90 :
                                    task.status === 'in-progress' ? 60 : 0
                                  } 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="by-member" className="space-y-4">
          {teamMembers.map(member => {
            const memberTasks = tasks.filter(task => task.assigneeId === member.id);
            const workload = getMemberWorkload(member.id);
            
            return (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>{member.role} - {member.team}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Workload</div>
                      <div className="text-2xl font-bold">{Math.round(workload)}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memberTasks.map(task => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                                {task.priority}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs text-muted-foreground">{task.estimatedHours}h estimated</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="unassigned">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Tasks</CardTitle>
              <CardDescription>Tasks that need to be assigned to team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.filter(task => !task.assigneeId).map(task => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        </div>
                        <Select onValueChange={(value) => assignTask(task.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} - {member.team}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskAllocation;