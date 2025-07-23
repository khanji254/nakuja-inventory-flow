import React, { useState } from 'react';
import { CheckCircle2, Clock, Eye, AlertCircle, MessageSquare, Calendar, User, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import useTeamManagement, { Task } from '@/hooks/useTeamManagement';

const NotionTaskStatus: React.FC = () => {
  const { tasks, teamMembers, updateTaskStatus } = useTeamManagement();
  const [selectedStatus, setSelectedStatus] = useState<Task['status'] | 'all'>('all');
  const [newNote, setNewNote] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Completed'
        };
      case 'in-progress':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'In Progress'
        };
      case 'review':
        return {
          icon: <Eye className="h-4 w-4" />,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'In Review'
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Not Started'
        };
    }
  };

  const getPriorityConfig = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return { color: 'bg-red-500', label: 'Urgent' };
      case 'high':
        return { color: 'bg-orange-500', label: 'High' };
      case 'medium':
        return { color: 'bg-yellow-500', label: 'Medium' };
      default:
        return { color: 'bg-green-500', label: 'Low' };
    }
  };

  const addNote = (taskId: string) => {
    if (newNote.trim()) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        updateTaskStatus(taskId, task.status, newNote.trim());
        setNewNote('');
        setSelectedTaskId(null);
      }
    }
  };

  const filteredTasks = tasks.filter(task => 
    selectedStatus === 'all' || task.status === selectedStatus
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <div>
              <CardTitle>Task Status Dashboard</CardTitle>
              <div className="text-sm text-muted-foreground">Notion-style task tracking</div>
            </div>
          </div>
          <Select value={selectedStatus} onValueChange={(value: 'all' | 'completed' | 'not-started' | 'in-progress' | 'review') => setSelectedStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 py-2 px-3 text-xs font-medium text-muted-foreground border-b">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1">Due</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Task Rows */}
          <div className="space-y-1">
            {filteredTasks.map((task) => {
              const statusConfig = getStatusConfig(task.status);
              const priorityConfig = getPriorityConfig(task.priority);
              const assignee = task.assigneeId ? teamMembers.find(m => m.id === task.assigneeId) : null;
              const isExpanded = selectedTaskId === task.id;

              return (
                <div key={task.id} className="group">
                  {/* Main Task Row */}
                  <div className="grid grid-cols-12 gap-3 py-3 px-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border">
                    {/* Task Info */}
                    <div className="col-span-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => setSelectedTaskId(isExpanded ? null : task.id)}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{task.description}</div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      <Select 
                        value={task.status} 
                        onValueChange={(value: Task['status']) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="h-8 border-none bg-transparent p-0">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="review">In Review</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priorityConfig.color}`} />
                        <span className="text-xs">{priorityConfig.label}</span>
                      </div>
                    </div>

                    {/* Assignee */}
                    <div className="col-span-2 flex items-center">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-xs text-muted-foreground">
                        {format(task.endDate, 'MMM dd')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-xs text-muted-foreground">
                        {task.estimatedHours}h
                      </span>
                    </div>
                  </div>

                  {/* Expanded Notes Section */}
                  {isExpanded && (
                    <div className="ml-12 mr-3 mb-3 p-4 bg-muted/30 rounded-lg border border-dashed">
                      <div className="space-y-3">
                        {/* Existing Notes */}
                        {task.notes.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Updates & Notes</div>
                            {task.notes.map((note, index) => (
                              <div key={index} className="text-sm p-3 bg-background rounded border-l-2 border-primary">
                                {note}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add New Note */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Add Update</div>
                          <div className="flex gap-2">
                            <Textarea
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Add a note, update, or comment..."
                              className="flex-1 min-h-[60px] text-sm"
                            />
                            <div className="flex flex-col gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => addNote(task.id)}
                                disabled={!newNote.trim()}
                              >
                                Add
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setNewNote('');
                                  setSelectedTaskId(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Task Meta Info */}
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {format(task.startDate, 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Est. {task.estimatedHours} hours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            <span>Category: {task.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found for the selected status
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionTaskStatus;
