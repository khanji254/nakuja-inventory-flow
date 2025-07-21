import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, differenceInDays, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import useTeamManagement, { Task } from '@/hooks/useTeamManagement';

interface GanttChartProps {
  weekStart?: Date;
  onExportPDF?: () => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  weekStart = new Date(), 
  onExportPDF 
}) => {
  const { tasks, teamMembers, getWeeklySchedule } = useTeamManagement();
  const weeklySchedule = getWeeklySchedule(weekStart);
  
  const weekDays = useMemo(() => {
    const start = startOfWeek(weekStart);
    const end = endOfWeek(weekStart);
    return eachDayOfInterval({ start, end });
  }, [weekStart]);

  const getTaskPosition = (task: Task) => {
    const weekStartDate = startOfWeek(weekStart);
    const weekEndDate = endOfWeek(weekStart);
    
    const taskStart = task.startDate > weekStartDate ? task.startDate : weekStartDate;
    const taskEnd = task.endDate < weekEndDate ? task.endDate : weekEndDate;
    
    const startOffset = differenceInDays(taskStart, weekStartDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: `${(startOffset / 7) * 100}%`,
      width: `${(duration / 7) * 100}%`
    };
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-green-500';
    }
  };

  return (
    <Card id="gantt-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <div>
              <CardTitle>Weekly Gantt Chart</CardTitle>
              <div className="text-sm text-muted-foreground">
                {format(startOfWeek(weekStart), 'MMM dd')} - {format(endOfWeek(weekStart), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
          {onExportPDF && (
            <Button onClick={onExportPDF} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Header */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="py-2">
                <div>{format(day, 'EEE')}</div>
                <div className="text-xs">{format(day, 'MM/dd')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Team Member */}
        <div className="space-y-6">
          {teamMembers.map((member) => {
            const memberTasks = weeklySchedule.teamAllocations[member.id] || [];
            
            return (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-32 flex-shrink-0">
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.team}</div>
                  </div>
                  <div className="flex-1 relative h-16 bg-muted/20 rounded border">
                    {/* Timeline Grid */}
                    <div className="absolute inset-0 grid grid-cols-7">
                      {weekDays.map((_, index) => (
                        <div key={index} className="border-r border-muted/30 last:border-r-0" />
                      ))}
                    </div>
                    
                    {/* Task Bars */}
                    {memberTasks.map((task) => {
                      const position = getTaskPosition(task);
                      return (
                        <div
                          key={task.id}
                          className={`absolute top-1 h-14 rounded border-l-4 ${getPriorityColor(task.priority)} bg-white shadow-sm overflow-hidden group hover:shadow-md transition-shadow`}
                          style={position}
                        >
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div>
                              <div className="text-xs font-medium truncate">{task.title}</div>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {task.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.estimatedHours}h
                            </div>
                          </div>
                          
                          {/* Progress indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1">
                            <div 
                              className={`h-full ${getStatusColor(task.status)}`}
                              style={{ 
                                width: task.status === 'completed' ? '100%' : 
                                       task.status === 'in-progress' ? '60%' : 
                                       task.status === 'review' ? '90%' : '0%' 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    {memberTasks.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        No tasks assigned
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Legend</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded" />
              <span>Not Started</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;