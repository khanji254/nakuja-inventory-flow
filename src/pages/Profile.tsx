import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Calendar, Camera, Save, Edit, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { Team, UserRole, UserProfile, Task, UserTaskSummary, TaskStatus } from '@/types';
import { taskService } from '@/lib/task-service';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const { toast } = useToast();

  // Task management states
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [taskSummary, setTaskSummary] = useState<UserTaskSummary | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    role: 'team-member' as UserRole,
    team: 'Recovery' as Team,
    phone: '',
    department: '',
    bio: '',
    skills: [],
    joinDate: new Date(),
    preferences: {
      theme: 'system',
      notifications: true,
      emailUpdates: true,
      language: 'en'
    }
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(profile);
      loadUserTasks();
    }
  }, [profile]);

  // Load user tasks and summary
  const loadUserTasks = async () => {
    if (!profile?.id) return;
    
    try {
      setLoadingTasks(true);
      const [tasks, summary] = await Promise.all([
        taskService.getTasksForUser(profile.id),
        taskService.getUserTaskSummary(profile.id)
      ]);
      setUserTasks(tasks);
      setTaskSummary(summary);
    } catch (error) {
      console.error('Failed to load user tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  // Update task progress
  const updateTaskProgress = async (taskId: string, progress: number, status?: TaskStatus, notes?: string) => {
    if (!profile?.id) return;

    try {
      await taskService.updateTaskProgress(taskId, profile.id, progress, status, undefined, notes);
      await loadUserTasks(); // Reload tasks
      toast({
        title: "Success",
        description: "Task progress updated successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to update task progress:', error);
      toast({
        title: "Error", 
        description: "Failed to update task progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: 'Profile updated successfully' });
        setIsEditing(false);
      },
      onError: () => {
        toast({ 
          title: 'Error updating profile',
          description: 'Please try again later',
          variant: 'destructive'
        });
      }
    });
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(Boolean);
    setFormData({ ...formData, skills });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="text-xl">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{profile.role}</Badge>
              <Badge>{profile.team}</Badge>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Select 
                  value={formData.team} 
                  onValueChange={(value) => setFormData({...formData, team: value as Team})}
                  disabled={!isEditing}
                >
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
                <Label>Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value as UserRole})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="team-lead">Team Lead</SelectItem>
                    <SelectItem value="team-member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Skills (comma separated)</Label>
              <Input
                value={formData.skills?.join(', ') || ''}
                onChange={(e) => handleSkillsChange(e.target.value)}
                disabled={!isEditing}
                placeholder="React, TypeScript, Python..."
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              My Tasks
            </CardTitle>
            <CardDescription>View and update your task progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : taskSummary ? (
              <>
                {/* Task Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Total Tasks</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{taskSummary.totalTasks}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{taskSummary.completedTasks}</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">In Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900">{taskSummary.inProgressTasks}</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Overdue</span>
                    </div>
                    <div className="text-2xl font-bold text-red-900">{taskSummary.overdueTasks}</div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Completion Rate</span>
                    <span className="text-sm text-gray-600">{Math.round(taskSummary.completionRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${taskSummary.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Tasks */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Tasks</h3>
                  {userTasks.filter(task => task.status !== 'completed').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No active tasks! Great job!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userTasks
                        .filter(task => task.status !== 'completed')
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .map((task) => (
                          <div key={task.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                  <span>{task.estimatedHours}h estimated</span>
                                  <Badge 
                                    variant={task.priority.includes('urgent') ? 'destructive' : 'outline'}
                                    className="text-xs"
                                  >
                                    {task.priority.replace('-', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              <Badge 
                                variant={
                                  task.status === 'completed' ? 'default' :
                                  task.status === 'in-progress' ? 'secondary' :
                                  task.status === 'blocked' ? 'destructive' : 'outline'
                                }
                              >
                                {task.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            {/* Progress Control */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm">Progress: {task.progress}%</Label>
                                <Select 
                                  value={task.status} 
                                  onValueChange={(value) => updateTaskProgress(task.id, task.progress, value as TaskStatus)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not-started">Not Started</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                    <SelectItem value="under-review">Under Review</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={task.progress}
                                  onChange={(e) => {
                                    const progress = parseInt(e.target.value);
                                    const newStatus = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';
                                    updateTaskProgress(task.id, progress, newStatus as TaskStatus);
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const notes = prompt('Add notes about your progress:');
                                    if (notes !== null) {
                                      updateTaskProgress(task.id, task.progress, task.status, notes);
                                    }
                                  }}
                                >
                                  Add Note
                                </Button>
                              </div>
                              
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Completed Tasks (Recent) */}
                {userTasks.filter(task => task.status === 'completed').length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recently Completed</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userTasks
                        .filter(task => task.status === 'completed')
                        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
                        .slice(0, 5)
                        .map((task) => (
                          <div key={task.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{task.title}</span>
                              {task.completedAt && (
                                <span className="text-xs text-gray-500 ml-2">
                                  Completed {new Date(task.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No task data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={formData.preferences.theme} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  preferences: { ...formData.preferences, theme: value as 'light' | 'dark' | 'system' }
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={formData.preferences.notifications}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, notifications: checked }
                  })}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for activity
                  </p>
                </div>
                <Switch
                  checked={formData.preferences.emailUpdates}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, emailUpdates: checked }
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex gap-2">
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
