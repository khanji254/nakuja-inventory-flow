import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface MatrixTask {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  deadline: Date;
  estimatedHours: number;
}

interface PDFExportProps {
  onExportGantt?: () => void;
  onExportTaskList?: () => void;
  matrixTasks?: {
    'important-urgent': MatrixTask[];
    'important-not-urgent': MatrixTask[];
    'not-important-urgent': MatrixTask[];
    'not-important-not-urgent': MatrixTask[];
  };
  currentWeek?: Date;
  onTabChange?: (tab: string) => void;
}

const PDFExport: React.FC<PDFExportProps> = ({ onExportGantt, onExportTaskList, matrixTasks, currentWeek, onTabChange }) => {
  const [loadingStates, setLoadingStates] = React.useState({
    matrix: false,
    gantt: false,
    tasks: false,
    weekly: false,
    multiWeek: false,
    csv: false
  });

  const exportGanttChart = async () => {
    setLoadingStates(prev => ({ ...prev, gantt: true }));
    
    try {
      // Switch to gantt tab if tab switching is available
      if (onTabChange) {
        onTabChange('gantt');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const ganttElement = document.getElementById('gantt-chart');
      if (!ganttElement) {
        alert('Please switch to the "Calendar" tab first, then come back to Export tab and try again.');
        return;
      }

      const canvas = await html2canvas(ganttElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 270;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 30;

      // Add header
      pdf.setFontSize(16);
      pdf.text('Weekly Gantt Chart', 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Week: ${format(startOfWeek(currentWeek || new Date()), 'MMM dd')} - ${format(endOfWeek(currentWeek || new Date()), 'MMM dd, yyyy')}`, 15, 22);
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 27);

      // Add image
      pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = currentWeek 
        ? `gantt-chart-week-${format(currentWeek, 'yyyy-MM-dd')}.pdf`
        : `gantt-chart-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      // Return to export tab
      if (onTabChange) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onTabChange('export');
      }
      
      if (onExportGantt) onExportGantt();
    } catch (error) {
      console.error('Error exporting Gantt chart:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, gantt: false }));
    }
  };

  const exportTaskAllocation = async () => {
    setLoadingStates(prev => ({ ...prev, tasks: true }));
    
    try {
      // Switch to tasks tab if tab switching is available
      if (onTabChange) {
        onTabChange('tasks');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const taskElement = document.getElementById('task-allocation');
      if (!taskElement) {
        alert('Please switch to the "Tasks" tab first, then come back to Export tab and try again.');
        return;
      }

      const canvas = await html2canvas(taskElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      // Add header
      pdf.setFontSize(16);
      pdf.text('Weekly Task Allocation', 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 22);

      // Add image
      pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`task-allocation-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      // Return to export tab
      if (onTabChange) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onTabChange('export');
      }
      
      if (onExportTaskList) onExportTaskList();
    } catch (error) {
      console.error('Error exporting task allocation:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, tasks: false }));
    }
  };

  const exportEisenhowerMatrix = async () => {
    setLoadingStates(prev => ({ ...prev, matrix: true }));
    
    try {
      // Switch to matrix tab if tab switching is available
      if (onTabChange) {
        onTabChange('matrix');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const matrixElement = document.getElementById('eisenhower-matrix');
      if (!matrixElement) {
        alert('Please switch to the "Matrix" tab first, then come back to Export tab and try again.');
        return;
      }

      const canvas = await html2canvas(matrixElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 270;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      // Add header
      pdf.setFontSize(16);
      pdf.text('Eisenhower Priority Matrix', 15, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 22);

      // Add image
      pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`eisenhower-matrix-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      // Return to export tab
      if (onTabChange) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onTabChange('export');
      }
    } catch (error) {
      console.error('Error exporting Eisenhower matrix:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, matrix: false }));
    }
  };

  const exportMatrixToCSV = () => {
    setLoadingStates(prev => ({ ...prev, csv: true }));
    
    try {
      if (!matrixTasks) return;

      const csvContent = Object.entries(matrixTasks).flatMap(([quadrant, tasks]) =>
        tasks.map(task => ({
          Quadrant: quadrant.replace('-', ' & '),
          Title: task.title,
          Description: task.description,
          'Assignee ID': task.assigneeId,
          Deadline: format(task.deadline, 'yyyy-MM-dd'),
          'Estimated Hours': task.estimatedHours
        }))
      );

      const headers = ['Quadrant', 'Title', 'Description', 'Assignee ID', 'Deadline', 'Estimated Hours'];
      const csvString = [
        headers.join(','),
        ...csvContent.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eisenhower-matrix-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, csv: false }));
    }
  };

  const exportWeeklyReport = async () => {
    setLoadingStates(prev => ({ ...prev, weekly: true }));
    
    try {
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      let yPosition = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.text('Weekly Progress Report', 15, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.text(`Week: ${format(startOfWeek(currentWeek || new Date()), 'MMM dd')} - ${format(endOfWeek(currentWeek || new Date()), 'MMM dd, yyyy')}`, 15, yPosition);
      yPosition += 10;
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, yPosition);
      yPosition += 20;

      // Add matrix if available
      const matrixElement = document.getElementById('eisenhower-matrix');
      if (matrixElement && yPosition < 200) {
        const matrixCanvas = await html2canvas(matrixElement, {
          scale: 1.2,
          backgroundColor: '#ffffff'
        });
        const matrixImg = matrixCanvas.toDataURL('image/png');
        const imgHeight = (matrixCanvas.height * 180) / matrixCanvas.width;
        pdf.addImage(matrixImg, 'PNG', 15, yPosition, 180, imgHeight);
        yPosition += imgHeight + 20;
      }

      pdf.save(`weekly-report-${format(currentWeek || new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting weekly report:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, weekly: false }));
    }
  };

  const exportMultiWeekReport = async (weeksCount: number) => {
    setLoadingStates(prev => ({ ...prev, multiWeek: true }));
    
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4');

      // Add title page
      pdf.setFontSize(20);
      pdf.text('Multi-Week Report', 15, 20);
      pdf.setFontSize(12);
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 30);
      pdf.text(`Covering ${weeksCount} weeks`, 15, 40);

      pdf.save(`multi-week-report-${weeksCount}-weeks-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting multi-week report:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, multiWeek: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <div>
            <CardTitle>Export Data</CardTitle>
            <div className="text-sm text-muted-foreground">
              Generate PDF and CSV reports for your project data
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={exportEisenhowerMatrix} 
            disabled={loadingStates.matrix}
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {loadingStates.matrix ? 'Exporting...' : 'Matrix (PDF)'}
              </div>
              <div className="text-xs text-muted-foreground">Priority matrix view</div>
            </div>
          </Button>

          {matrixTasks && (
            <Button 
              onClick={exportMatrixToCSV} 
              disabled={loadingStates.csv}
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">
                  {loadingStates.csv ? 'Exporting...' : 'Matrix (CSV)'}
                </div>
                <div className="text-xs text-muted-foreground">Task data export</div>
              </div>
            </Button>
          )}

          <Button 
            onClick={exportGanttChart} 
            disabled={loadingStates.gantt}
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {loadingStates.gantt ? 'Exporting...' : 'Gantt Chart'}
              </div>
              <div className="text-xs text-muted-foreground">Weekly timeline view</div>
            </div>
          </Button>

          <Button 
            onClick={exportTaskAllocation} 
            disabled={loadingStates.tasks}
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {loadingStates.tasks ? 'Exporting...' : 'Task Allocation'}
              </div>
              <div className="text-xs text-muted-foreground">Team assignments</div>
            </div>
          </Button>

          <Button 
            onClick={exportWeeklyReport} 
            disabled={loadingStates.weekly}
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {loadingStates.weekly ? 'Exporting...' : 'Weekly Report'}
              </div>
              <div className="text-xs text-muted-foreground">Complete overview</div>
            </div>
          </Button>

          {currentWeek && (
            <Button 
              onClick={() => exportMultiWeekReport(4)} 
              disabled={loadingStates.multiWeek}
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">
                  {loadingStates.multiWeek ? 'Exporting...' : '4-Week Report'}
                </div>
                <div className="text-xs text-muted-foreground">Extended timeline</div>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFExport;
