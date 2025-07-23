import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

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

const PDFExport: React.FC<PDFExportProps> = ({ 
  onExportGantt, 
  onExportTaskList, 
  matrixTasks, 
  currentWeek, 
  onTabChange 
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const exportWithTabSwitch = async (
    targetTab: string,
    elementId: string,
    fileName: string,
    exportFunction: () => Promise<void>
  ) => {
    setIsExporting(true);
    
    try {
      // Switch to the target tab if available
      if (onTabChange) {
        onTabChange(targetTab);
        // Wait for tab to render
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Check if element exists
      const element = document.getElementById(elementId);
      if (!element) {
        alert(`Please switch to the "${targetTab}" tab first, then try the export again.`);
        return;
      }
      
      await exportFunction();
      
      // Return to export tab
      if (onTabChange) {
        setTimeout(() => onTabChange('export'), 500);
      }
      
    } catch (error) {
      console.error(`Error exporting ${fileName}:`, error);
      alert(`Failed to export ${fileName}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const createPDF = async (elementId: string, fileName: string, orientation: 'portrait' | 'landscape' = 'landscape') => {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element ${elementId} not found`);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    
    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;
    const imgWidth = pageWidth - 30;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add header
    pdf.setFontSize(16);
    pdf.text(fileName.replace(/[-_]/g, ' ').replace('.pdf', ''), 15, 15);
    pdf.setFontSize(10);
    pdf.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, 22);
    
    // Add image
    let position = 30;
    pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
    
    // Handle multiple pages if needed
    let heightLeft = imgHeight;
    while (heightLeft >= pageHeight - 30) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(fileName);
  };

  const exportEisenhowerMatrix = async () => {
    await createPDF('eisenhower-matrix', `eisenhower-matrix-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportGanttChart = async () => {
    await createPDF('gantt-chart', `gantt-chart-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportTaskAllocation = async () => {
    await createPDF('task-allocation', `task-allocation-${format(new Date(), 'yyyy-MM-dd')}.pdf`, 'portrait');
  };

  const exportMatrixToCSV = () => {
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
  };

  const handleMatrixExport = () => {
    exportWithTabSwitch('matrix', 'eisenhower-matrix', 'Eisenhower Matrix', exportEisenhowerMatrix);
  };

  const handleGanttExport = () => {
    exportWithTabSwitch('gantt', 'gantt-chart', 'Gantt Chart', exportGanttChart);
  };

  const handleTaskExport = () => {
    exportWithTabSwitch('tasks', 'task-allocation', 'Task Allocation', exportTaskAllocation);
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
            onClick={handleMatrixExport}
            disabled={isExporting}
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {isExporting ? 'Exporting...' : 'Matrix (PDF)'}
              </div>
              <div className="text-xs text-muted-foreground">Priority matrix view</div>
            </div>
          </Button>

          {matrixTasks && (
            <Button 
              onClick={exportMatrixToCSV}
              disabled={isExporting}
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Matrix (CSV)</div>
                <div className="text-xs text-muted-foreground">Task data export</div>
              </div>
            </Button>
          )}

          <Button 
            onClick={handleGanttExport}
            disabled={isExporting}
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {isExporting ? 'Exporting...' : 'Gantt Chart'}
              </div>
              <div className="text-xs text-muted-foreground">Weekly timeline view</div>
            </div>
          </Button>

          <Button 
            onClick={handleTaskExport}
            disabled={isExporting}
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {isExporting ? 'Exporting...' : 'Task Allocation'}
              </div>
              <div className="text-xs text-muted-foreground">Team assignments</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFExport;
