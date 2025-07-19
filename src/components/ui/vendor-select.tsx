import React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useActiveVendors, useVendors } from '@/hooks/useVendors';
import { Vendor } from '@/types';

interface VendorSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showPaymentMethods?: boolean;
  onAddNew?: () => void;
}

export const VendorSelect: React.FC<VendorSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select vendor...",
  className,
  disabled = false,
  showPaymentMethods = true,
  onAddNew
}) => {
  const [open, setOpen] = React.useState(false);
  const { data: allVendors = [], isLoading } = useVendors();
  const vendors = useActiveVendors();

  const selectedVendor = vendors.find(vendor => vendor.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedVendor ? (
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-medium truncate">{selectedVendor.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {selectedVendor.companyName}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search vendors..." />
            <CommandEmpty>
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">No vendors found.</p>
                {onAddNew && (
                  <Button variant="outline" size="sm" onClick={onAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Vendor
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {isLoading ? (
                <CommandItem disabled>Loading vendors...</CommandItem>
              ) : (
                vendors.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    value={`${vendor.name} ${vendor.companyName}`}
                    onSelect={() => {
                      onValueChange(vendor.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === vendor.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{vendor.name}</span>
                          {vendor.category && (
                            <Badge variant="outline" className="text-xs">
                              {vendor.category}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {vendor.companyName}
                        </span>
                        {vendor.location && (
                          <span className="text-xs text-muted-foreground truncate">
                            {vendor.location.city}, {vendor.location.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            {onAddNew && vendors.length > 0 && (
              <div className="border-t p-2">
                <Button variant="ghost" size="sm" className="w-full" onClick={onAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Vendor
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedVendor && showPaymentMethods && selectedVendor.paymentMethods.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Available Payment Methods:</span>
          <div className="flex flex-wrap gap-1">
            {selectedVendor.paymentMethods.map((method, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {method.method === 'paybill' && 'Paybill'}
                {method.method === 'paybill-with-store' && 'Paybill + Store'}
                {method.method === 'till-number' && 'Till Number'}
                {method.method === 'pochi-la-biashara' && 'Pochi La Biashara'}
                {method.method === 'send-money' && 'Send Money'}
                {method.method === 'bank-transfer' && 'Bank Transfer'}
                {method.method === 'cash' && 'Cash'}
                {method.method === 'credit-card' && 'Credit Card'}
                {method.details && `: ${method.details}`}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorSelect;
