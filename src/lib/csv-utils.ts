import Papa from 'papaparse';
import { InventoryItem, PurchaseRequest, BOMItem } from '@/types';

// CSV Export Functions
export const exportInventoryToCSV = (inventory: InventoryItem[], filename = 'inventory-export.csv') => {
  const csvData = inventory.map(item => ({
    'Item Name': item.name,
    'Category': item.category,
    'Vendor': item.vendor,
    'Unit Price': item.unitPrice,
    'Current Stock': item.currentStock,
    'Quantity': item.quantity,
    'Reorder Point': item.reorderPoint,
    'Location': item.location || '',
    'Part Number': item.partNumber || '',
    'Min Stock': item.minStock || '',
    'Description': item.description || '',
    'Priority': item.priority || 'normal',
    'Eisenhower Quadrant': item.eisenhowerQuadrant || '',
    'Last Updated': item.lastUpdated.toISOString().split('T')[0],
    'Updated By': item.updatedBy
  }));

  downloadCSV(csvData, filename);
};

export const exportPurchaseRequestsToCSV = (requests: PurchaseRequest[], filename = 'purchase-requests-export.csv') => {
  const csvData = requests.map(request => ({
    'Item Name': request.itemName,
    'Title': request.title || '',
    'Description': request.description || '',
    'Type': request.type || '',
    'Unit Price': request.unitPrice,
    'Quantity': request.quantity,
    'Urgency': request.urgency,
    'Vendor': request.vendor,
    'Requested By': request.requestedBy,
    'Requested Date': request.requestedDate.toISOString().split('T')[0],
    'Status': request.status,
    'Approved By': request.approvedBy || '',
    'Approved Date': request.approvedDate ? request.approvedDate.toISOString().split('T')[0] : '',
    'Notes': request.notes || '',
    'Team': request.team,
    'Eisenhower Quadrant': request.eisenhowerQuadrant || ''
  }));

  downloadCSV(csvData, filename);
};

export const exportBOMToCSV = (bomItems: BOMItem[], filename = 'bom-export.csv') => {
  const csvData = bomItems.map(item => ({
    'Item Name': item.itemName,
    'Description': item.description || '',
    'Part Number': item.partNumber || '',
    'Category': item.category || '',
    'Required Quantity': item.requiredQuantity,
    'Quantity': item.quantity,
    'Unit Price': item.unitPrice,
    'Total Price': item.totalPrice,
    'Vendor': item.vendor,
    'Team': item.team,
    'Inventory Item ID': item.inventoryItemId || '',
    'Available Stock': item.availableStock || '',
    'Shortfall': item.shortfall || '',
    'Notes': item.notes || ''
  }));

  downloadCSV(csvData, filename);
};

// CSV Import Functions
export const parseInventoryCSV = (file: File): Promise<InventoryItem[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const inventory: InventoryItem[] = results.data.map((row: any, index: number) => {
            // Validate required fields
            if (!row['Item Name'] || !row['Category'] || !row['Vendor']) {
              throw new Error(`Row ${index + 1}: Missing required fields (Item Name, Category, or Vendor)`);
            }

            return {
              id: generateId(),
              name: String(row['Item Name']).trim(),
              category: String(row['Category']).trim(),
              vendor: String(row['Vendor']).trim(),
              unitPrice: parseFloat(row['Unit Price']) || 0,
              currentStock: parseInt(row['Current Stock']) || 0,
              quantity: parseInt(row['Quantity']) || 0,
              reorderPoint: parseInt(row['Reorder Point']) || 0,
              location: row['Location'] ? String(row['Location']).trim() : undefined,
              partNumber: row['Part Number'] ? String(row['Part Number']).trim() : undefined,
              minStock: row['Min Stock'] ? parseInt(row['Min Stock']) : undefined,
              description: row['Description'] ? String(row['Description']).trim() : undefined,
              priority: validatePriority(row['Priority']) as InventoryItem['priority'],
              eisenhowerQuadrant: validateEisenhowerQuadrant(row['Eisenhower Quadrant']) as InventoryItem['eisenhowerQuadrant'],
              lastUpdated: new Date(),
              updatedBy: 'CSV Import'
            };
          });

          resolve(inventory);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

export const parsePurchaseRequestsCSV = (file: File): Promise<PurchaseRequest[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const requests: PurchaseRequest[] = results.data.map((row: any, index: number) => {
            // Validate required fields
            if (!row['Item Name'] || !row['Vendor'] || !row['Requested By']) {
              throw new Error(`Row ${index + 1}: Missing required fields (Item Name, Vendor, or Requested By)`);
            }

            return {
              id: generateId(),
              itemName: String(row['Item Name']).trim(),
              title: row['Title'] ? String(row['Title']).trim() : undefined,
              description: row['Description'] ? String(row['Description']).trim() : undefined,
              type: row['Type'] ? String(row['Type']).trim() : undefined,
              unitPrice: parseFloat(row['Unit Price']) || 0,
              quantity: parseInt(row['Quantity']) || 1,
              urgency: validateUrgency(row['Urgency']) as PurchaseRequest['urgency'],
              vendor: String(row['Vendor']).trim(),
              requestedBy: String(row['Requested By']).trim(),
              requestedDate: row['Requested Date'] ? new Date(row['Requested Date']) : new Date(),
              status: validateStatus(row['Status']) as PurchaseRequest['status'],
              approvedBy: row['Approved By'] ? String(row['Approved By']).trim() : undefined,
              approvedDate: row['Approved Date'] ? new Date(row['Approved Date']) : undefined,
              notes: row['Notes'] ? String(row['Notes']).trim() : undefined,
              team: validateTeam(row['Team']) as PurchaseRequest['team'],
              eisenhowerQuadrant: validateEisenhowerQuadrant(row['Eisenhower Quadrant']) as PurchaseRequest['eisenhowerQuadrant']
            };
          });

          resolve(requests);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

// Helper Functions
const downloadCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const validatePriority = (priority: string): string => {
  const validPriorities = ['urgent', 'important', 'normal', 'low'];
  const normalized = priority?.toLowerCase().trim();
  return validPriorities.includes(normalized) ? normalized : 'normal';
};

const validateUrgency = (urgency: string): string => {
  const validUrgencies = ['low', 'medium', 'high', 'critical'];
  const normalized = urgency?.toLowerCase().trim();
  return validUrgencies.includes(normalized) ? normalized : 'medium';
};

const validateStatus = (status: string): string => {
  const validStatuses = ['pending', 'approved', 'rejected', 'ordered'];
  const normalized = status?.toLowerCase().trim();
  return validStatuses.includes(normalized) ? normalized : 'pending';
};

const validateTeam = (team: string): string => {
  const validTeams = ['Avionics', 'Telemetry', 'Parachute', 'Recovery'];
  const normalized = team?.trim();
  return validTeams.includes(normalized) ? normalized : 'Avionics';
};

const validateEisenhowerQuadrant = (quadrant: string): string | undefined => {
  const validQuadrants = ['important-urgent', 'important-not-urgent', 'not-important-urgent', 'not-important-not-urgent'];
  const normalized = quadrant?.toLowerCase().trim();
  return validQuadrants.includes(normalized) ? normalized : undefined;
};

// CSV Template Generation
export const generateInventoryCSVTemplate = () => {
  const template = [{
    'Item Name': 'Example Component',
    'Category': 'Electronics',
    'Vendor': 'Example Vendor',
    'Unit Price': '25.50',
    'Current Stock': '100',
    'Quantity': '100',
    'Reorder Point': '20',
    'Location': 'Warehouse A',
    'Part Number': 'EXM-001',
    'Min Stock': '10',
    'Description': 'Example component description',
    'Priority': 'normal',
    'Eisenhower Quadrant': 'important-not-urgent',
    'Last Updated': new Date().toISOString().split('T')[0],
    'Updated By': 'System'
  }];

  downloadCSV(template, 'inventory-template.csv');
};

export const generatePurchaseRequestCSVTemplate = () => {
  const template = [{
    'Item Name': 'Example Item',
    'Title': 'Purchase Request Title',
    'Description': 'Item description',
    'Type': 'Component',
    'Unit Price': '15.75',
    'Quantity': '5',
    'Urgency': 'medium',
    'Vendor': 'Example Vendor',
    'Requested By': 'John Doe',
    'Requested Date': new Date().toISOString().split('T')[0],
    'Status': 'pending',
    'Approved By': '',
    'Approved Date': '',
    'Notes': 'Additional notes',
    'Team': 'Avionics',
    'Eisenhower Quadrant': 'important-not-urgent'
  }];

  downloadCSV(template, 'purchase-request-template.csv');
};
