import React, { useRef, useState } from 'react';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  exportInventoryToCSV, 
  parseInventoryCSV, 
  generateInventoryCSVTemplate,
  exportPurchaseRequestsToCSV,
  parsePurchaseRequestsCSV,
  generatePurchaseRequestCSVTemplate,
  exportBOMToCSV
} from '@/lib/csv-utils';
import { InventoryItem, PurchaseRequest, BOMItem } from '@/types';

interface CSVImportExportProps {
  data: InventoryItem[] | PurchaseRequest[] | BOMItem[];
  type: 'inventory' | 'purchase-requests' | 'bom';
  onImport: (data: any[]) => Promise<void>;
  className?: string;
}

export const CSVImportExport: React.FC<CSVImportExportProps> = ({
  data,
  type,
  onImport,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getFilenameSuffix = () => {
    const date = new Date().toISOString().split('T')[0];
    return `${type}-${date}.csv`;
  };

  const handleExport = () => {
    try {
      switch (type) {
        case 'inventory':
          exportInventoryToCSV(data as InventoryItem[], getFilenameSuffix());
          break;
        case 'purchase-requests':
          exportPurchaseRequestsToCSV(data as PurchaseRequest[], getFilenameSuffix());
          break;
        case 'bom':
          exportBOMToCSV(data as BOMItem[], getFilenameSuffix());
          break;
      }
      
      toast({
        title: "Export Successful",
        description: `${data.length} items exported to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to CSV",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = () => {
    try {
      switch (type) {
        case 'inventory':
          generateInventoryCSVTemplate();
          break;
        case 'purchase-requests':
          generatePurchaseRequestCSVTemplate();
          break;
        case 'bom':
          // You can add BOM template generation here if needed
          toast({
            title: "Template not available",
            description: "BOM template generation is not yet implemented",
            variant: "destructive",
          });
          return;
      }
      
      toast({
        title: "Template Downloaded",
        description: "CSV template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download CSV template",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportError('Please select a CSV file');
      return;
    }

    handleImport(file);
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);
    setImportProgress(0);

    try {
      setImportProgress(25);
      
      let parsedData: any[];
      
      switch (type) {
        case 'inventory':
          parsedData = await parseInventoryCSV(file);
          break;
        case 'purchase-requests':
          parsedData = await parsePurchaseRequestsCSV(file);
          break;
        default:
          throw new Error(`Import not supported for ${type}`);
      }

      setImportProgress(50);

      if (parsedData.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      setImportProgress(75);

      await onImport(parsedData);

      setImportProgress(100);
      setImportSuccess(true);

      toast({
        title: "Import Successful",
        description: `${parsedData.length} items imported from CSV`,
      });

      // Close dialog after successful import
      setTimeout(() => {
        setIsDialogOpen(false);
        setImportProgress(0);
        setImportSuccess(false);
      }, 2000);

    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Failed to import CSV data',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const resetImportState = () => {
    setImportError(null);
    setImportSuccess(false);
    setImportProgress(0);
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'inventory': return 'Inventory';
      case 'purchase-requests': return 'Purchase Requests';
      case 'bom': return 'Bill of Materials';
      default: return 'Data';
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Export Button */}
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>

      {/* Import Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={resetImportState}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import {getTypeLabel()} from CSV</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Download Template Button */}
            <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Download the CSV template to ensure proper formatting
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadTemplate}
                disabled={type === 'bom'}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* File Upload */}
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Select CSV File'}
              </Button>
            </div>

            {/* Progress Bar */}
            {isImporting && (
              <div className="space-y-2">
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-center text-gray-600">
                  Importing... {importProgress}%
                </p>
              </div>
            )}

            {/* Success Message */}
            {importSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Import completed successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {importError}
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>CSV Format Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Headers must match template exactly</li>
                <li>Required fields must not be empty</li>
                <li>Use the correct format for dates (YYYY-MM-DD)</li>
                <li>Numbers should be in decimal format (e.g., 25.50)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CSVImportExport;
