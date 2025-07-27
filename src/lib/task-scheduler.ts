// Task Scheduler Service for managing daily email notifications
import { taskService } from './task-service';
import { emailService } from './email-service';


class TaskSchedulerService {
  private isScheduled = false;
  private schedulerInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize the task scheduler
   */
  async initialize(): Promise<void> {
    console.log('🕐 Initializing Task Scheduler...');
    
    // Schedule daily emails at 8:00 AM
    this.scheduleDailyEmails();
    
    // Check for overdue tasks every hour
    this.scheduleOverdueChecks();
    
    console.log('✅ Task Scheduler initialized successfully');
  }

  /**
   * Schedule daily task summary emails
   */
  private scheduleDailyEmails(): void {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(8, 0, 0, 0); // 8:00 AM

    // If it's already past 8 AM today, schedule for tomorrow
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilFirstRun = scheduledTime.getTime() - now.getTime();

    console.log(`📅 Daily emails scheduled for ${scheduledTime.toLocaleString()}`);

    // Set initial timeout
    setTimeout(() => {
      this.sendDailyTaskEmails();
      
      // Then set daily interval (24 hours)
      this.schedulerInterval = setInterval(() => {
        this.sendDailyTaskEmails();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilFirstRun);
  }

  /**
   * Schedule overdue task checks every hour
   */
  private scheduleOverdueChecks(): void {
    setInterval(() => {
      this.checkOverdueTasks();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Send daily task emails to all users
   */
  private async sendDailyTaskEmails(): Promise<void> {
    try {
      console.log('📧 Starting daily task email distribution...');
      
      // Get all users (this would typically come from a user service)
      const users = await this.getAllUsers();
      
      if (users.length === 0) {
        console.log('No users found for email notification');
        return;
      }

      await taskService.sendDailyTaskEmails(users);
      
      console.log(`✅ Daily task emails sent to ${users.length} users`);
    } catch (error) {
      console.error('❌ Failed to send daily task emails:', error);
    }
  }

  /**
   * Check for overdue tasks and send notifications
   */
  private async checkOverdueTasks(): Promise<void> {
    try {
      console.log('⏰ Checking for overdue tasks...');
      
      const users = await this.getAllUsers();
      const now = new Date();
      
      for (const user of users) {
        const userTasks = await taskService.getTasksForUser(user.id);
        const overdueTasks = userTasks.filter(task => 
          task.deadline < now && 
          task.status !== 'completed' && 
          task.status !== 'cancelled'
        );

        if (overdueTasks.length > 0 && user.preferences?.emailUpdates) {
          // Send overdue notification
          console.log(`📨 Sending overdue notification to ${user.email} for ${overdueTasks.length} tasks`);
          
          // This would typically send an email notification
          // For now, we'll just log it
          console.log(`User ${user.name} has ${overdueTasks.length} overdue tasks:`, 
            overdueTasks.map(t => t.title).join(', '));
        }
      }
    } catch (error) {
      console.error('❌ Failed to check overdue tasks:', error);
    }
  }

  /**
   * Get all users from the system
   */
  private async getAllUsers(): Promise<any[]> {
    try {
      // This is a mock implementation
      // In a real system, this would fetch from a database or user service
      const mockUsers = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john.doe@nakuja.com',
          role: 'MEMBER',
          teamId: 'team1',
          preferences: { emailUpdates: true, notifications: true }
        },
        {
          id: 'user2',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@nakuja.com',
          role: 'TEAM_LEAD',
          teamId: 'team2',
          preferences: { emailUpdates: true, notifications: true }
        },
        {
          id: 'user3',
          name: 'Mike Johnson',
          email: 'mike.johnson@nakuja.com',
          role: 'MEMBER',
          teamId: 'team3',
          preferences: { emailUpdates: false, notifications: true }
        }
      ];

      return mockUsers;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  /**
   * Manually trigger daily emails (for testing)
   */
  async triggerDailyEmails(): Promise<void> {
    console.log('🔄 Manually triggering daily task emails...');
    await this.sendDailyTaskEmails();
  }

  /**
   * Manually check overdue tasks (for testing)
   */
  async triggerOverdueCheck(): Promise<void> {
    console.log('🔄 Manually checking overdue tasks...');
    await this.checkOverdueTasks();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.isScheduled = false;
    console.log('🛑 Task Scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; nextEmailTime: string } {
    const nextEmail = new Date();
    nextEmail.setDate(nextEmail.getDate() + 1);
    nextEmail.setHours(8, 0, 0, 0);

    return {
      isRunning: this.isScheduled,
      nextEmailTime: nextEmail.toLocaleString()
    };
  }

  /**
   * Schedule a one-time reminder for a specific task
   */
  async scheduleTaskReminder(taskId: string, reminderTime: Date): Promise<void> {
    const now = new Date();
    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(async () => {
        try {
          // Get task details and send reminder
          const allTasks = await taskService.getAllTasks();
          const task = allTasks.find(t => t.id === taskId);
          
          if (task) {
            console.log(`🔔 Sending task reminder for: ${task.title}`);
            // This would send a reminder notification
          }
        } catch (error) {
          console.error('Failed to send task reminder:', error);
        }
      }, timeUntilReminder);

      console.log(`⏰ Task reminder scheduled for ${reminderTime.toLocaleString()}`);
    }
  }
}

export const taskScheduler = new TaskSchedulerService();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize the scheduler when the module loads
  taskScheduler.initialize().catch(console.error);
  
  // Expose to window for debugging
  (window as any).taskScheduler = taskScheduler;
}
