// Task Service for managing tasks across the application
import { Task, TaskProgress, TaskStatus, TaskPriority, MatrixTask, MatrixTasks, User, UserTaskSummary } from '@/types';
import { User as PermissionsUser } from '@/lib/permissions';
import { localStorageService } from './storage-service';
import { emailService } from './email-service';

class TaskService {
  /**
   * Get filtered matrix tasks for a user (members see only their tasks)
   */
  async getFilteredMatrixTasks(user: User): Promise<MatrixTasks> {
    const allMatrixTasks = await this.getMatrixTasks();
    // Admins and leads see all tasks, members see only their own
    if (user.role === 'team-member') {
      const filteredTasks: MatrixTasks = {
        'important-urgent': allMatrixTasks['important-urgent'].filter(t => t.assigneeId === user.id),
        'important-not-urgent': allMatrixTasks['important-not-urgent'].filter(t => t.assigneeId === user.id),
        'not-important-urgent': allMatrixTasks['not-important-urgent'].filter(t => t.assigneeId === user.id),
        'not-important-not-urgent': allMatrixTasks['not-important-not-urgent'].filter(t => t.assigneeId === user.id)
      };
      return filteredTasks;
    }
    return allMatrixTasks;
  }
  private storageKey = 'nakuja-tasks';
  private progressStorageKey = 'nakuja-task-progress';

  // Mock task data for development
  private mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Inventory System Integration',
      description: 'Integrate the new inventory tracking system with existing workflows',
      assigneeId: 'user1',
      assigneeName: 'John Doe',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      estimatedHours: 8,
      actualHours: 6,
      priority: 'important-urgent',
      status: 'in-progress',
      progress: 60,
      category: 'development',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      createdBy: 'admin',
      teamId: 'team1',
      tags: ['system', 'integration'],
      notes: 'Integration is progressing well, need to finalize API endpoints'
    },
    {
      id: '2',
      title: 'Update User Documentation',
      description: 'Create comprehensive user guide for the new features',
      assigneeId: 'user2',
      assigneeName: 'Sarah Wilson',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      estimatedHours: 4,
      priority: 'important-not-urgent',
      status: 'not-started',
      progress: 0,
      category: 'documentation',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      createdBy: 'admin',
      teamId: 'team2',
      tags: ['documentation', 'user-guide']
    },
    {
      id: '3',
      title: 'Fix Login Bug',
      description: 'Resolve the authentication issue affecting mobile users',
      assigneeId: 'user1',
      assigneeName: 'John Doe',
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      estimatedHours: 2,
      actualHours: 1.5,
      priority: 'not-important-urgent',
      status: 'under-review',
      progress: 90,
      category: 'development',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      createdBy: 'user2',
      teamId: 'team1',
      tags: ['bug', 'mobile', 'auth']
    },
    {
      id: '4',
      title: 'Prepare Monthly Report',
      description: 'Compile and analyze monthly inventory and purchase data',
      assigneeId: 'user3',
      assigneeName: 'Mike Johnson',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      estimatedHours: 6,
      priority: 'not-important-not-urgent',
      status: 'not-started',
      progress: 0,
      category: 'documentation',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      createdBy: 'admin',
      teamId: 'team3',
      tags: ['report', 'monthly', 'analysis']
    }
  ];

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    const stored = localStorageService.getItem<Task[]>(this.storageKey);
    if (stored && stored.length > 0) {
      return stored.map(task => ({
        ...task,
        deadline: new Date(task.deadline),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
    }

    // Initialize with mock data
    localStorageService.setItem(this.storageKey, this.mockTasks);
    return this.mockTasks;
  }

  /**
   * Get tasks for a specific user
   */
  async getTasksForUser(userId: string): Promise<Task[]> {
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => task.assigneeId === userId);
  }

  /**
   * Get tasks organized for Eisenhower Matrix
   */
  async getMatrixTasks(): Promise<MatrixTasks> {
    const allTasks = await this.getAllTasks();
    const matrixTasks: MatrixTasks = {
      'important-urgent': [],
      'important-not-urgent': [],
      'not-important-urgent': [],
      'not-important-not-urgent': []
    };

    allTasks.forEach(task => {
      const matrixTask: MatrixTask = task;
      matrixTasks[task.priority].push(matrixTask);
    });

    return matrixTasks;
  }

  /**
   * Get filtered matrix tasks for a user (members see only their tasks)
   */
// Duplicate getFilteredMatrixTasks removed

  /**
   * Create a new task
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const allTasks = await this.getAllTasks();
    allTasks.push(newTask);
    localStorageService.setItem(this.storageKey, allTasks);

    // Send notification email if user has email updates enabled
    // This would typically get the user data from a service
    console.log('📧 Task created notification would be sent');

    return newTask;
  }

  /**
   * Update task progress
   */
  async updateTaskProgress(
    taskId: string, 
    userId: string, 
    progress: number, 
    status?: TaskStatus, 
    actualHours?: number,
    notes?: string
  ): Promise<boolean> {
    try {
      const allTasks = await this.getAllTasks();
      const taskIndex = allTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const task = allTasks[taskIndex];
      
      // Update task
      allTasks[taskIndex] = {
        ...task,
        progress: Math.max(0, Math.min(100, progress)),
        status: status || task.status,
        actualHours: actualHours || task.actualHours,
        notes: notes || task.notes,
        updatedAt: new Date(),
        completedAt: progress === 100 && status === 'completed' ? new Date() : task.completedAt
      };

      localStorageService.setItem(this.storageKey, allTasks);

      // Store progress history
      const progressUpdate: TaskProgress = {
        taskId,
        userId,
        progress,
        actualHours,
        status: status || task.status,
        notes,
        updatedAt: new Date()
      };

      const progressHistory = localStorageService.getItem<TaskProgress[]>(this.progressStorageKey) || [];
      progressHistory.push(progressUpdate);
      localStorageService.setItem(this.progressStorageKey, progressHistory);

      console.log(`📊 Task ${taskId} progress updated to ${progress}% by user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to update task progress:', error);
      return false;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const allTasks = await this.getAllTasks();
      const filteredTasks = allTasks.filter(t => t.id !== taskId);
      localStorageService.setItem(this.storageKey, filteredTasks);
      
      console.log(`🗑️ Task ${taskId} deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  /**
   * Get user task summary/dashboard
   */
  async getUserTaskSummary(userId: string): Promise<UserTaskSummary> {
    const userTasks = await this.getTasksForUser(userId);
    const now = new Date();

    const completedTasks = userTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = userTasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = userTasks.filter(t => 
      t.deadline < now && t.status !== 'completed'
    ).length;

    const totalEstimatedHours = userTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const totalActualHours = userTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const completionRate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;
    
    const completedWithHours = userTasks.filter(t => t.status === 'completed' && t.actualHours);
    const averageTaskTime = completedWithHours.length > 0 
      ? completedWithHours.reduce((sum, t) => sum + (t.actualHours || 0), 0) / completedWithHours.length
      : 0;

    const upcomingDeadlines = userTasks
      .filter(t => t.deadline > now && t.status !== 'completed')
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 5);

    return {
      userId,
      totalTasks: userTasks.length,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      averageTaskTime,
      upcomingDeadlines
    };
  }

  /**
   * Send daily task emails to all users
   */
  async sendDailyTaskEmails(users: User[]): Promise<void> {
    console.log('📅 Sending daily task emails...');
    
    for (const user of users) {
      // TODO: Check user preferences once type is fixed
      // if (user.preferences?.emailUpdates) {
        const userTasks = await this.getTasksForUser(user.id);
        
        // Only send if user has tasks for today or upcoming
        const relevantTasks = userTasks.filter(task => {
          const daysDiff = Math.ceil((task.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7 && task.status !== 'completed'; // Tasks due within 7 days
        });

        if (relevantTasks.length > 0) {
          const taskNotifications = relevantTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            priority: task.priority,
            estimatedHours: task.estimatedHours
          }));

          await emailService.sendDailyTaskEmail(user, taskNotifications);
        }
      // }
    }
  };

  /**
   * Get task progress history for a task
   */
  async getTaskProgressHistory(taskId: string): Promise<TaskProgress[]> {
    const progressHistory = localStorageService.getItem<TaskProgress[]>(this.progressStorageKey) || [];
    return progressHistory
      .filter(p => p.taskId === taskId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Schedule daily emails (would be called by a cron job or scheduler)
   */
  async scheduleTaskNotifications(): Promise<void> {
    // This would typically be called by a background service
    // For demo purposes, we'll just log it
    console.log('⏰ Daily task notification scheduler would run here');
    
    // In a real application, this would:
    // 1. Get all users with email preferences enabled
    // 2. Get their tasks for today/upcoming
    // 3. Send personalized daily summary emails
    // 4. Schedule follow-up reminders for overdue tasks
  }
}

export const taskService = new TaskService();
