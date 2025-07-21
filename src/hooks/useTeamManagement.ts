import { useState, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addDays, eachDayOfInterval } from 'date-fns';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  avatar?: string;
  skills: string[];
  workload: number; // 0-100 percentage
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  status: 'not-started' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  actualHours?: number;
  startDate: Date;
  endDate: Date;
  notes: string[];
  dependencies?: string[];
  category: string;
  quadrant: string;
}

export interface WeeklySchedule {
  weekStart: Date;
  tasks: Task[];
  teamAllocations: Record<string, Task[]>;
}

const useTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'tm-1',
      name: 'Alex Rodriguez',
      role: 'Lead Engineer',
      team: 'Recovery',
      skills: ['Leadership', 'Systems', 'Testing'],
      workload: 75
    },
    {
      id: 'tm-2',
      name: 'Sarah Kim',
      role: 'Avionics Specialist',
      team: 'Avionics',
      skills: ['Electronics', 'PCB Design', 'Firmware'],
      workload: 60
    },
    {
      id: 'tm-3',
      name: 'Marcus Johnson',
      role: 'Software Developer',
      team: 'Telemetry',
      skills: ['React', 'Node.js', 'Data Analysis'],
      workload: 80
    },
    {
      id: 'tm-4',
      name: 'Emily Chen',
      role: 'Parachute Engineer',
      team: 'Parachute',
      skills: ['Textiles', 'CAD', 'Testing'],
      workload: 45
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Update inventory tracking system',
      description: 'Implement barcode scanning for better accuracy',
      assigneeId: 'tm-3',
      status: 'in-progress',
      priority: 'high',
      estimatedHours: 16,
      actualHours: 8,
      startDate: new Date(),
      endDate: addDays(new Date(), 3),
      notes: ['Started UI implementation', 'Need to test barcode scanner'],
      category: 'inventory',
      quadrant: 'important-not-urgent'
    },
    {
      id: 'task-2',
      title: 'Low stock alert: Deployment bags',
      description: 'Order more deployment bags - only 2 remaining',
      assigneeId: 'tm-4',
      status: 'not-started',
      priority: 'urgent',
      estimatedHours: 2,
      startDate: new Date(),
      endDate: new Date(),
      notes: [],
      category: 'inventory',
      quadrant: 'important-urgent'
    }
  ]);

  const assignTask = useCallback((taskId: string, memberId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assigneeId: memberId } : task
    ));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status'], note?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedNotes = note ? [...task.notes, `${format(new Date(), 'MMM dd, HH:mm')}: ${note}`] : task.notes;
        return { ...task, status, notes: updatedNotes };
      }
      return task;
    }));
  }, []);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'notes'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      notes: []
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const getWeeklySchedule = useCallback((date: Date): WeeklySchedule => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    
    const weekTasks = tasks.filter(task => 
      (task.startDate >= weekStart && task.startDate <= weekEnd) ||
      (task.endDate >= weekStart && task.endDate <= weekEnd) ||
      (task.startDate <= weekStart && task.endDate >= weekEnd)
    );

    const teamAllocations = teamMembers.reduce((acc, member) => {
      acc[member.id] = weekTasks.filter(task => task.assigneeId === member.id);
      return acc;
    }, {} as Record<string, Task[]>);

    return {
      weekStart,
      tasks: weekTasks,
      teamAllocations
    };
  }, [tasks, teamMembers]);

  const getTasksByQuadrant = useCallback((quadrant: string) => {
    return tasks.filter(task => task.quadrant === quadrant);
  }, [tasks]);

  const getMemberWorkload = useCallback((memberId: string) => {
    const memberTasks = tasks.filter(task => 
      task.assigneeId === memberId && 
      task.status !== 'completed'
    );
    
    const totalHours = memberTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    return Math.min((totalHours / 40) * 100, 100); // Assuming 40-hour work week
  }, [tasks]);

  return {
    teamMembers,
    setTeamMembers,
    tasks,
    setTasks,
    assignTask,
    updateTaskStatus,
    addTask,
    getWeeklySchedule,
    getTasksByQuadrant,
    getMemberWorkload
  };
};

export default useTeamManagement;