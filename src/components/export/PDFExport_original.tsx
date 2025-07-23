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
  
  const exportMatrixToCSV = () => {
    if (!matrixTasks) return;

    const csvData = [];
    
    // Add header
    csvData.push(['Quadrant', 'Task Title', 'Description', 'Assigned To', 'Deadline', 'Estimated Hours']);
    
    // Add tasks from each quadrant
    Object.entries(matrixTasks).forEach(([quadrant, tasks]) => {
      const quadrantName = quadrant.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      tasks.forEach(task => {
        csvData.push([
          quadrantName,
          task.title,
          task.description,
          task.assigneeId || 'Unassigned',
          task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '',
          task.estimatedHours || ''
        ]);
      });
    });

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download CSV
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eisenhower-matrix-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportGanttChart = async () => {
    setLoadingStates(prev => ({ ...prev, gantt: true }));
    console.log('Attempting to export Gantt chart...');
    
    try {
      // Switch to gantt tab if tab switching is available
      if (onTabChange) {
        onTabChange('gantt');
        // Wait a bit for the tab to render
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const ganttElement = document.getElementById('gantt-chart');
      console.log('Gantt chart element found:', ganttElement);
      if (!ganttElement) {
        console.error('Gantt chart element not found');
        alert('Please switch to the "Calendar" tab first, then come back to Export tab and try again.');
        return;
      }

      try {
      const canvas = await html2canvas(ganttElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 290;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;

      // Add header
      pdf.setFontSize(16);
      pdf.text('Weekly Gantt Chart', 15, 15);
      pdf.setFontSize(10);
      if (currentWeek) {
        pdf.text(`Week: ${format(startOfWeek(currentWeek), 'MMM dd')} - ${format(endOfWeek(currentWeek), 'MMM dd, yyyy')}`, 15, 22);
        pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 27);
        position = 35;
      } else {
        pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 22);
        position = 30;
      }

      // Add image
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = currentWeek 
        ? `gantt-chart-week-${format(currentWeek, 'yyyy-MM-dd')}.pdf`
        : `gantt-chart-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      // Return to export tab if tab switching is available
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
    console.log('Attempting to export task allocation...');
    
    try {
      // Switch to tasks tab if tab switching is available
      if (onTabChange) {
        onTabChange('tasks');
        // Wait a bit for the tab to render
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const taskElement = document.getElementById('task-allocation');
      console.log('Task allocation element found:', taskElement);
      if (!taskElement) {
        console.error('Task allocation element not found');
        alert('Please switch to the "Tasks" tab first, then come back to Export tab and try again.');
        return;
      }

      try {
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
      
      // Return to export tab if tab switching is available
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
    console.log('Attempting to export Eisenhower matrix...');
    
    try {
      // Switch to matrix tab if tab switching is available
      if (onTabChange) {
        onTabChange('matrix');
        // Wait a bit for the tab to render
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const matrixElement = document.getElementById('eisenhower-matrix');
      console.log('Matrix element found:', matrixElement);
      if (!matrixElement) {
        console.error('Eisenhower matrix element not found');
        alert('Please switch to the "Matrix" tab first, then come back to Export tab and try again.');
        return;
      }

      try {
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
      
      // Return to export tab if tab switching is available
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

  const exportWeeklyReport = async () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Weekly Project Report', 15, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Week of ${format(new Date(), 'MMM dd, yyyy')}`, 15, 30);
    
    // Try to capture both Gantt and Task elements
    const ganttElement = document.getElementById('gantt-chart');
    const taskElement = document.getElementById('task-allocation');
    
    let yPosition = 40;

    try {
      // Add Gantt Chart
      if (ganttElement) {
        const ganttCanvas = await html2canvas(ganttElement, {
          scale: 1.5,
          backgroundColor: '#ffffff'
        });
        
        const ganttImgData = ganttCanvas.toDataURL('image/png');
        const ganttWidth = 180;
        const ganttHeight = (ganttCanvas.height * ganttWidth) / ganttCanvas.width;
        
        pdf.setFontSize(14);
        pdf.text('Project Timeline', 15, yPosition);
        yPosition += 10;
        
        pdf.addImage(ganttImgData, 'PNG', 15, yPosition, ganttWidth, ganttHeight);
        yPosition += ganttHeight + 15;
      }

      // Add new page for task allocation if needed
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }

      // Add Task Allocation
      if (taskElement) {
        const taskCanvas = await html2canvas(taskElement, {
          scale: 1.5,
          backgroundColor: '#ffffff'
        });
        
        const taskImgData = taskCanvas.toDataURL('image/png');
        const taskWidth = 180;
        const taskHeight = (taskCanvas.height * taskWidth) / taskCanvas.width;
        
        pdf.setFontSize(14);
        pdf.text('Task Allocation', 15, yPosition);
        yPosition += 10;
        
        pdf.addImage(taskImgData, 'PNG', 15, yPosition, taskWidth, taskHeight);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 290);

      pdf.save(`weekly-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating weekly report:', error);
    }
  };

  const exportMultiWeekReport = async (weeksCount: number) => {
    if (!currentWeek) return;

    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    // Header
    pdf.setFontSize(20);
    pdf.text(`${weeksCount}-Week Project Report`, 15, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Period: ${format(startOfWeek(currentWeek), 'MMM dd')} - ${format(endOfWeek(new Date(currentWeek.getTime() + (weeksCount - 1) * 7 * 24 * 60 * 60 * 1000)), 'MMM dd, yyyy')}`, 15, 30);

    // Try to capture Gantt chart
    const ganttElement = document.getElementById('gantt-chart');
    
    let yPosition = 50;

    try {
      if (ganttElement) {
        const ganttCanvas = await html2canvas(ganttElement, {
          scale: 1.2,
          backgroundColor: '#ffffff'
        });
        
        const ganttImgData = ganttCanvas.toDataURL('image/png');
        const ganttWidth = 180;
        const ganttHeight = (ganttCanvas.height * ganttWidth) / ganttCanvas.width;
        
        pdf.setFontSize(14);
        pdf.text('Current Week Timeline', 15, yPosition);
        yPosition += 10;
        
        pdf.addImage(ganttImgData, 'PNG', 15, yPosition, ganttWidth, ganttHeight);
        yPosition += ganttHeight + 15;
      }

      // Add task allocation if available
      const taskElement = document.getElementById('task-allocation');
      if (taskElement && yPosition < 200) {
        if (yPosition > 150) {
          pdf.addPage();
          yPosition = 20;
        }

        const taskCanvas = await html2canvas(taskElement, {
          scale: 1.2,
          backgroundColor: '#ffffff'
        });
        
        const taskImgData = taskCanvas.toDataURL('image/png');
        const taskWidth = 180;
        const taskHeight = (taskCanvas.height * taskWidth) / taskCanvas.width;
        
        pdf.setFontSize(14);
        pdf.text('Task Allocation Overview', 15, yPosition);
        yPosition += 10;
        
        pdf.addImage(taskImgData, 'PNG', 15, yPosition, taskWidth, Math.min(taskHeight, 200));
      }

      // Footer
      pdf.setFontSize(8);
      pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 290);

      pdf.save(`${weeksCount}-week-report-${format(currentWeek, 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating multi-week report:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <div>
            <CardTitle>Export Reports</CardTitle>
            <div className="text-sm text-muted-foreground">Download project reports as PDF</div>
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
            <Button onClick={exportMatrixToCSV} variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Matrix (CSV)</div>
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
              <div className="text-xs text-muted-foreground">Team assignments</div>
            </div>
          </Button>

          <Button onClick={exportWeeklyReport} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Weekly Report</div>
              <div className="text-xs text-muted-foreground">Complete overview</div>
            </div>
          </Button>

          {currentWeek && (
            <Button onClick={() => exportMultiWeekReport(4)} variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">4-Week Report</div>
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