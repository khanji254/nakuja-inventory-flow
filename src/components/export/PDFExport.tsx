import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '../ui/button';
import { Download, FileText, BarChart3, Users } from 'lucide-react';

interface PDFExportProps {
  onTabChange?: (tab: string) => void;
}

interface LoadingStates {
  gantt: boolean;
  tasks: boolean;
  matrix: boolean;
}

const PDFExport: React.FC<PDFExportProps> = ({ onTabChange }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    gantt: false,
    tasks: false,
    matrix: false,
  });

  // Utility function to create PDF from element
  const createPDF = async (elementId: string, filename: string): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  };

  // Wrapper function for exports with tab switching
  const exportWithTabSwitch = async (
    tabName: string,
    elementId: string,
    filename: string,
    loadingKey: keyof LoadingStates
  ): Promise<void> => {
    try {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));

      // Switch to the required tab if callback is provided
      if (onTabChange) {
        onTabChange(tabName);
        // Wait for tab to render
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await createPDF(elementId, filename);
      alert(`${filename} exported successfully!`);
    } catch (error) {
      console.error(`Error exporting ${filename}:`, error);
      alert(`Failed to export ${filename}. Please try again.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleMatrixExport = () => {
    exportWithTabSwitch('matrix', 'eisenhower-matrix', 'eisenhower_matrix.pdf', 'matrix');
  };

  const handleGanttExport = () => {
    exportWithTabSwitch('gantt', 'gantt-chart', 'gantt_chart.pdf', 'gantt');
  };

  const handleTaskExport = () => {
    exportWithTabSwitch('tasks', 'task-allocation', 'task_allocation.pdf', 'tasks');
  };

  const exportWeeklyReport = async () => {
    try {
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Weekly Project Report', 20, 30);
      
      // Add date
      const date = new Date().toLocaleDateString();
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${date}`, 20, 50);
      
      // Add content sections
      pdf.setFontSize(14);
      pdf.text('Project Overview', 20, 80);
      pdf.setFontSize(10);
      pdf.text('This report contains a summary of all project activities for the week.', 20, 95);
      
      pdf.text('Key Metrics:', 20, 115);
      pdf.text('• Tasks completed: Pending data integration', 25, 130);
      pdf.text('• Project progress: On track', 25, 145);
      pdf.text('• Team utilization: Optimal', 25, 160);
      
      pdf.save('weekly_report.pdf');
      alert('Weekly report exported successfully!');
    } catch (error) {
      console.error('Error exporting weekly report:', error);
      alert('Failed to export weekly report. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <Button 
        onClick={handleMatrixExport} 
        variant="outline" 
        className="h-auto p-4 flex flex-col gap-2"
        disabled={loadingStates.matrix}
      >
        <FileText className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium">
            {loadingStates.matrix ? 'Exporting...' : 'Matrix PDF'}
          </div>
          <div className="text-xs text-muted-foreground">Eisenhower matrix</div>
        </div>
      </Button>

      <Button 
        onClick={handleGanttExport} 
        variant="outline" 
        className="h-auto p-4 flex flex-col gap-2"
        disabled={loadingStates.gantt}
      >
        <BarChart3 className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium">
            {loadingStates.gantt ? 'Exporting...' : 'Gantt PDF'}
          </div>
          <div className="text-xs text-muted-foreground">Timeline view</div>
        </div>
      </Button>

      <Button 
        onClick={handleTaskExport} 
        variant="outline" 
        className="h-auto p-4 flex flex-col gap-2"
        disabled={loadingStates.tasks}
      >
        <Users className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium">
            {loadingStates.tasks ? 'Exporting...' : 'Tasks PDF'}
          </div>
          <div className="text-xs text-muted-foreground">Team assignments</div>
        </div>
      </Button>

      <Button 
        onClick={exportWeeklyReport} 
        variant="outline" 
        className="h-auto p-4 flex flex-col gap-2"
      >
        <Download className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium">Weekly Report</div>
          <div className="text-xs text-muted-foreground">Summary document</div>
        </div>
      </Button>
    </div>
  );
};

export default PDFExport;
