import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vendor, PaymentMethod } from '@/types';
import { localStorageService } from '@/lib/storage-service';

// Mock vendor data
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Aerospace Supplies Co.',
    companyName: 'Aerospace Supplies Company Limited',
    contactPerson: 'Jane Smith',
    email: 'sales@aerospacesupplies.co.ke',
    phone: '+254 700 123 456',
    alternativePhone: '+254 722 654 321',
    location: {
      address: 'Industrial Area, Mombasa Road',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya',
      coordinates: {
        latitude: -1.2921,
        longitude: 36.8219
      }
    },
    paymentMethods: [
      {
        method: 'paybill',
        details: '522533',
        accountName: 'ASC001',
        additionalInfo: 'KCB Bank Paybill'
      },
      {
        method: 'bank-transfer',
        details: 'KCB Bank - 1234567890',
        accountName: 'Aerospace Supplies Company Limited'
      }
    ],
    category: 'Materials',
    rating: 4.5,
    notes: 'Reliable supplier for aerospace materials. Good quality and delivery times.',
    website: 'https://aerospacesupplies.co.ke',
    registrationNumber: 'C.123456',
    taxNumber: 'P051234567A',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Flight Electronics Inc.',
    companyName: 'Flight Electronics Incorporated',
    contactPerson: 'Michael Johnson',
    email: 'orders@flightelectronics.com',
    phone: '+254 733 987 654',
    location: {
      address: 'Westlands, Waiyaki Way',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya'
    },
    paymentMethods: [
      {
        method: 'till-number',
        details: '891234',
        additionalInfo: 'M-Pesa Till Number'
      },
      {
        method: 'pochi-la-biashara',
        details: '+254 733 987 654',
        accountName: 'Flight Electronics',
        additionalInfo: 'Safaricom Pochi La Biashara'
      }
    ],
    category: 'Electronics',
    rating: 4.8,
    notes: 'Excellent electronics supplier. Fast delivery and competitive prices.',
    website: 'https://flightelectronics.com',
    isActive: true,
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-01-05'),
    createdBy: 'admin'
  },
  {
    id: '3',
    name: 'Parachute Systems LLC',
    companyName: 'Parachute Systems Limited Liability Company',
    contactPerson: 'Sarah Wilson',
    email: 'info@parachutesystems.co.ke',
    phone: '+254 711 456 789',
    location: {
      address: 'Mombasa Road, South C',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya'
    },
    paymentMethods: [
      {
        method: 'send-money',
        details: '+254 711 456 789',
        accountName: 'Sarah Wilson',
        additionalInfo: 'M-Pesa Send Money'
      },
      {
        method: 'paybill-with-store',
        details: '400200',
        accountName: 'PS001',
        additionalInfo: 'Equity Bank Paybill with Store Number'
      }
    ],
    category: 'Recovery Systems',
    rating: 4.2,
    notes: 'Specialized in parachute and recovery systems. Good technical support.',
    isActive: true,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-12-15'),
    createdBy: 'admin'
  },
  {
    id: '4',
    name: 'RF Solutions Co.',
    companyName: 'Radio Frequency Solutions Company',
    contactPerson: 'David Brown',
    email: 'sales@rfsolutions.co.ke',
    phone: '+254 720 123 987',
    location: {
      address: 'Karen, Langata Road',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya'
    },
    paymentMethods: [
      {
        method: 'cash',
        details: 'Cash on Delivery',
        additionalInfo: 'Preferred for orders below KES 50,000'
      },
      {
        method: 'bank-transfer',
        details: 'Cooperative Bank - 0987654321',
        accountName: 'RF Solutions Company'
      }
    ],
    category: 'Electronics',
    rating: 4.0,
    notes: 'Good for RF components and communication equipment.',
    website: 'https://rfsolutions.co.ke',
    isActive: true,
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-11-20'),
    createdBy: 'admin'
  },
  {
    id: '5',
    name: 'Navigation Systems',
    companyName: 'Navigation Systems Kenya Ltd',
    contactPerson: 'Peter Kamau',
    email: 'peter@navsystems.co.ke',
    phone: '+254 734 567 890',
    location: {
      address: 'Upper Hill, Nairobi',
      city: 'Nairobi',
      region: 'Nairobi County',
      country: 'Kenya'
    },
    paymentMethods: [
      {
        method: 'till-number',
        details: '567890',
        additionalInfo: 'Airtel Money Till'
      }
    ],
    category: 'Navigation',
    rating: 3.8,
    notes: 'Good GPS and navigation equipment supplier.',
    isActive: false,
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2023-10-30'),
    createdBy: 'admin'
  }
];

// Simulate API calls with localStorage persistence
const vendorsAPI = {
  getVendors: async (): Promise<Vendor[]> => {
    // Try to get from localStorage first
    const stored = localStorageService.getItem<Vendor[]>('vendors');
    if (stored) {
      return stored.map(vendor => ({
        ...vendor,
        createdAt: new Date(vendor.createdAt),
        updatedAt: new Date(vendor.updatedAt)
      }));
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Save mock data to localStorage and return
    localStorageService.setItem('vendors', mockVendors);
    return mockVendors;
  },

  addVendor: async (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> => {
    const newVendor: Vendor = {
      ...vendor,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Get current data
    const current = localStorageService.getItem<Vendor[]>('vendors') || [];
    const updated = [...current, newVendor];
    
    // Save to localStorage
    localStorageService.setItem('vendors', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return newVendor;
  },

  updateVendor: async (vendor: Vendor): Promise<Vendor> => {
    const updatedVendor = {
      ...vendor,
      updatedAt: new Date(),
    };
    
    // Get current data and update
    const current = localStorageService.getItem<Vendor[]>('vendors') || [];
    const updated = current.map(v => v.id === vendor.id ? updatedVendor : v);
    
    // Save to localStorage
    localStorageService.setItem('vendors', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return updatedVendor;
  },

  deleteVendor: async (vendorId: string): Promise<void> => {
    // Get current data and filter out deleted vendor
    const current = localStorageService.getItem<Vendor[]>('vendors') || [];
    const updated = current.filter(vendor => vendor.id !== vendorId);
    
    // Save to localStorage
    localStorageService.setItem('vendors', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  toggleVendorStatus: async (vendorId: string): Promise<Vendor> => {
    // Get current data
    const current = localStorageService.getItem<Vendor[]>('vendors') || [];
    
    // Toggle vendor status
    const updated = current.map(vendor => 
      vendor.id === vendorId 
        ? { ...vendor, isActive: !vendor.isActive, updatedAt: new Date() }
        : vendor
    );
    
    // Save to localStorage
    localStorageService.setItem('vendors', updated);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const updatedVendor = updated.find(v => v.id === vendorId);
    if (!updatedVendor) throw new Error('Vendor not found');
    return updatedVendor;
  }
};

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: vendorsAPI.getVendors,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vendorsAPI.addVendor,
    onSuccess: (newVendor) => {
      queryClient.setQueryData(['vendors'], (oldData: Vendor[] | undefined) => {
        return oldData ? [...oldData, newVendor] : [newVendor];
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vendorsAPI.updateVendor,
    onSuccess: (updatedVendor) => {
      queryClient.setQueryData(['vendors'], (oldData: Vendor[] | undefined) => {
        return oldData ? oldData.map(vendor => 
          vendor.id === updatedVendor.id ? updatedVendor : vendor
        ) : [updatedVendor];
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vendorsAPI.deleteVendor,
    onSuccess: (_, deletedVendorId) => {
      queryClient.setQueryData(['vendors'], (oldData: Vendor[] | undefined) => {
        return oldData ? oldData.filter(vendor => vendor.id !== deletedVendorId) : [];
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useToggleVendorStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vendorsAPI.toggleVendorStatus,
    onSuccess: (updatedVendor) => {
      queryClient.setQueryData(['vendors'], (oldData: Vendor[] | undefined) => {
        return oldData ? oldData.map(vendor => 
          vendor.id === updatedVendor.id ? updatedVendor : vendor
        ) : [updatedVendor];
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

// Helper hooks
export const useActiveVendors = () => {
  const { data: vendors = [] } = useVendors();
  return vendors.filter(vendor => vendor.isActive);
};

export const useVendorsByCategory = (category?: string) => {
  const { data: vendors = [] } = useVendors();
  return category 
    ? vendors.filter(vendor => vendor.category === category && vendor.isActive)
    : vendors.filter(vendor => vendor.isActive);
};
