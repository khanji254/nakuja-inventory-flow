import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface PDFExportProps {
  onExportGantt?: () => void;
  onExportTaskList?: () => void;
}

const PDFExport: React.FC<PDFExportProps> = ({ onExportGantt, onExportTaskList }) => {
  
  const exportGanttChart = async () => {
    const ganttElement = document.getElementById('gantt-chart');
    if (!ganttElement) return;

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

      pdf.save(`gantt-chart-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      if (onExportGantt) onExportGantt();
    } catch (error) {
      console.error('Error exporting Gantt chart:', error);
    }
  };

  const exportTaskAllocation = async () => {
    const taskElement = document.getElementById('task-allocation');
    if (!taskElement) return;

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
      
      if (onExportTaskList) onExportTaskList();
    } catch (error) {
      console.error('Error exporting task allocation:', error);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={exportGanttChart} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Gantt Chart</div>
              <div className="text-xs text-muted-foreground">Weekly timeline view</div>
            </div>
          </Button>

          <Button onClick={exportTaskAllocation} variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Task Allocation</div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFExport;