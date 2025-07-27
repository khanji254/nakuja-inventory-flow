// Task Management Demo Component
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, Users, BarChart3, Calendar, CheckCircle } from 'lucide-react';
import { taskScheduler } from '@/lib/task-scheduler';
import { taskService } from '@/lib/task-service';
import { emailService } from '@/lib/email-service';
import { useToast } from '@/hooks/use-toast';

const TaskManagementDemo = () => {
  const [loading, setLoading] = useState(false);
  const [emailsSent, setEmailsSent] = useState(0);
  const { toast } = useToast();

  const handleSendDailyEmails = async () => {
    setLoading(true);
    try {
      await taskScheduler.triggerDailyEmails();
      setEmailsSent(prev => prev + 1);
      toast({
        title: "Daily Emails Sent! 📧",
        description: "Task summary emails have been sent to all users with email notifications enabled.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send daily emails. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOverdue = async () => {
    setLoading(true);
    try {
      await taskScheduler.triggerOverdueCheck();
      toast({
        title: "Overdue Check Complete! ⏰",
        description: "Checked for overdue tasks and sent notifications where needed.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check overdue tasks. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const schedulerStatus = taskScheduler.getStatus();

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Task Management System Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive task management with email notifications and profile integration
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current status of the task management system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Task Scheduler</div>
                <div className="text-sm text-green-700">
                  {schedulerStatus.isRunning ? 'Running' : 'Active'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Email Service</div>
                <div className="text-sm text-blue-700">Ready</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">Profile Integration</div>
                <div className="text-sm text-purple-700">Active</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <Clock className="h-4 w-4 inline mr-1" />
            Next scheduled email: {schedulerStatus.nextEmailTime}
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>Daily task summaries and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ✅ Daily task summary emails at 8:00 AM<br/>
                ✅ Personalized HTML email templates<br/>
                ✅ Overdue task notifications<br/>
                ✅ User preference controls<br/>
                ✅ Task progress updates via email
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSendDailyEmails}
                disabled={loading}
                size="sm"
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Test Email'}
              </Button>
              <Button
                onClick={handleCheckOverdue}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Clock className="h-4 w-4 mr-2" />
                Check Overdue
              </Button>
            </div>
            {emailsSent > 0 && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                📧 {emailsSent} test email(s) sent! Check browser console for email content.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profile Integration
            </CardTitle>
            <CardDescription>Task management in user profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ✅ Task dashboard in user profile<br/>
                ✅ Progress tracking with sliders<br/>
                ✅ Status updates and notes<br/>
                ✅ Completion statistics<br/>
                ✅ Upcoming deadlines view
              </p>
            </div>
            <Button asChild size="sm" className="w-full">
              <a href="/profile">
                <Users className="h-4 w-4 mr-2" />
                View Profile Tasks
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Implementation Features
          </CardTitle>
          <CardDescription>What's been implemented in this task management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-800">✅ Completed Features</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Task Service with CRUD operations</li>
                <li>• Email Service with HTML templates</li>
                <li>• Task Scheduler for daily notifications</li>
                <li>• Profile-based task management</li>
                <li>• Progress tracking and updates</li>
                <li>• Role-based task filtering</li>
                <li>• Eisenhower Matrix integration</li>
                <li>• Task status management</li>
                <li>• User preference controls</li>
                <li>• Cross-page task synchronization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-800">🔧 Technical Implementation</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• TypeScript interfaces for type safety</li>
                <li>• LocalStorage for task persistence</li>
                <li>• React hooks for state management</li>
                <li>• Scheduled email notifications</li>
                <li>• Task progress history tracking</li>
                <li>• Email template generation</li>
                <li>• Permission-based UI controls</li>
                <li>• Toast notifications for feedback</li>
                <li>• Responsive task dashboard</li>
                <li>• Real-time progress updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation & Testing</CardTitle>
          <CardDescription>Explore the task management features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" size="sm">
              <a href="/eisenhower-matrix">
                <Calendar className="h-4 w-4 mr-2" />
                Task Matrix
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/profile">
                <Users className="h-4 w-4 mr-2" />
                Profile Tasks
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/purchase-requests">
                <CheckCircle className="h-4 w-4 mr-2" />
                Purchase Requests
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManagementDemo;
