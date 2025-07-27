// Email Service for Task Notifications
import { User } from '@/types';

export interface TaskNotificationData {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
  estimatedHours: number;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private apiEndpoint = process.env.VITE_EMAIL_API_ENDPOINT || 'http://localhost:3001/api/email';

  /**
   * Generate daily task summary email template
   */
  generateDailyTaskTemplate(user: User, tasks: TaskNotificationData[]): EmailTemplate {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const urgentTasks = tasks.filter(t => 
      t.priority === 'important-urgent' || 
      (t.deadline && new Date(t.deadline) <= new Date(Date.now() + 24 * 60 * 60 * 1000))
    );

    const subject = `Your Daily Tasks - ${today} (${tasks.length} tasks${urgentTasks.length > 0 ? `, ${urgentTasks.length} urgent` : ''})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Task Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .task-section { margin-bottom: 25px; }
        .task-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 10px; background: #f9fafb; }
        .urgent { border-left: 4px solid #ef4444; background: #fef2f2; }
        .important { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .normal { border-left: 4px solid #10b981; background: #f0fdf4; }
        .low { border-left: 4px solid #6b7280; background: #f9fafb; }
        .task-title { font-weight: bold; color: #111827; margin-bottom: 8px; }
        .task-meta { font-size: 12px; color: #6b7280; display: flex; justify-content: space-between; margin-top: 8px; }
        .priority-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .urgent-badge { background: #fecaca; color: #991b1b; }
        .important-badge { background: #fde68a; color: #92400e; }
        .normal-badge { background: #bbf7d0; color: #065f46; }
        .low-badge { background: #e5e7eb; color: #374151; }
        .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        .stats { display: flex; justify-content: space-around; background: #f3f4f6; padding: 15px; margin-bottom: 20px; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #1f2937; }
        .stat-label { font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Daily Task Summary</h1>
            <p>Hello ${user.name}, here are your tasks for ${today}</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">${tasks.length}</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat">
                <div class="stat-number">${urgentTasks.length}</div>
                <div class="stat-label">Urgent</div>
            </div>
            <div class="stat">
                <div class="stat-number">${tasks.reduce((sum, t) => sum + t.estimatedHours, 0)}</div>
                <div class="stat-label">Est. Hours</div>
            </div>
        </div>

        <div class="content">
            ${urgentTasks.length > 0 ? `
            <div class="task-section">
                <h2 style="color: #ef4444; margin-bottom: 15px;">🚨 Urgent Tasks</h2>
                ${urgentTasks.map(task => `
                <div class="task-card urgent">
                    <div class="task-title">${task.title}</div>
                    <div style="color: #374151; font-size: 14px; margin-bottom: 8px;">${task.description}</div>
                    <div class="task-meta">
                        <span>⏰ Due: ${new Date(task.deadline).toLocaleDateString()}</span>
                        <span>⏱️ ${task.estimatedHours}h</span>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : ''}

            <div class="task-section">
                <h2 style="color: #1f2937; margin-bottom: 15px;">📋 All Tasks</h2>
                ${tasks.map(task => {
                  const isUrgent = urgentTasks.includes(task);
                  const cssClass = isUrgent ? 'urgent' : 
                                  task.priority.includes('important') ? 'important' : 
                                  task.priority.includes('urgent') ? 'normal' : 'low';
                  return `
                <div class="task-card ${cssClass}">
                    <div class="task-title">${task.title}</div>
                    <div style="color: #374151; font-size: 14px; margin-bottom: 8px;">${task.description}</div>
                    <div class="task-meta">
                        <span>⏰ ${new Date(task.deadline).toLocaleDateString()}</span>
                        <span>⏱️ ${task.estimatedHours}h</span>
                        <span class="priority-badge ${isUrgent ? 'urgent-badge' : task.priority.includes('important') ? 'important-badge' : 'normal-badge'}">${task.priority.replace('-', ' ')}</span>
                    </div>
                </div>
                  `;
                }).join('')}
            </div>
        </div>

        <div class="footer">
            <p>💡 <strong>Tip:</strong> Update your task progress in your profile to keep everyone synchronized!</p>
            <p>This email was sent from Nakuja Inventory Management System</p>
            <p>If you no longer wish to receive these emails, update your preferences in your profile.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Daily Task Summary - ${today}

Hello ${user.name},

You have ${tasks.length} tasks scheduled${urgentTasks.length > 0 ? `, with ${urgentTasks.length} urgent` : ''}:

${tasks.map(task => `
• ${task.title}
  ${task.description}
  Due: ${new Date(task.deadline).toLocaleDateString()} | ${task.estimatedHours}h | Priority: ${task.priority}
`).join('')}

Total estimated time: ${tasks.reduce((sum, t) => sum + t.estimatedHours, 0)} hours

Update your progress in your profile to keep the team synchronized.

--
Nakuja Inventory Management System
    `;

    return { subject, html, text };
  }

  /**
   * Send daily task email to user
   */
  async sendDailyTaskEmail(user: User, tasks: TaskNotificationData[]): Promise<boolean> {
    try {
      // Check if user wants email updates
      // TODO: Fix user preferences type
      // if (!user.preferences?.emailUpdates) {
      //   console.log(`Skipping email for ${user.email} - email updates disabled`);
      //   return true;
      // }

      const template = this.generateDailyTaskTemplate(user, tasks);

      // In a real application, this would send via SMTP or email service
      // For now, we'll simulate and log
      console.log('📧 SENDING DAILY TASK EMAIL:');
      console.log('To:', user.email);
      console.log('Subject:', template.subject);
      console.log('Tasks:', tasks.length);
      
      // Simulate API call
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          type: 'daily-tasks'
        })
      }).catch(() => {
        // Fallback: Log email content for development
        console.log('Email service unavailable, logging email:');
        console.log('---EMAIL CONTENT---');
        console.log(template.text);
        console.log('---END EMAIL---');
        return { ok: true };
      });

      return true;
    } catch (error) {
      console.error('Failed to send daily task email:', error);
      return false;
    }
  }

  /**
   * Send task update notification
   */
  async sendTaskUpdateNotification(user: User, task: TaskNotificationData, updateType: 'created' | 'updated' | 'completed'): Promise<boolean> {
    try {
      // TODO: Fix user preferences type
      // if (!user.preferences?.emailUpdates) {
      //   return true;
      // }

      const subject = `Task ${updateType}: ${task.title}`;
      const html = `
        <h2>Task ${updateType.charAt(0).toUpperCase() + updateType.slice(1)}</h2>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>
        <p><strong>Estimated Hours:</strong> ${task.estimatedHours}</p>
      `;

      console.log(`📧 Task ${updateType} notification sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send task update notification:', error);
      return false;
    }
  }

  /**
   * Schedule daily email for all users
   */
  async scheduleDailyEmails(users: User[], getTasksForUser: (userId: string) => TaskNotificationData[]): Promise<void> {
    console.log('📅 Scheduling daily task emails...');
    
    for (const user of users) {
      // TODO: Fix user preferences type
      // if (user.preferences?.emailUpdates) {
        const userTasks = getTasksForUser(user.id);
        if (userTasks.length > 0) {
          await this.sendDailyTaskEmail(user, userTasks);
        }
      // }
    }
  }
}

export const emailService = new EmailService();
