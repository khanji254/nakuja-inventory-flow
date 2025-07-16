import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAddInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventoryData';
import { InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

const inventorySchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  vendor: z.string().min(1, 'Vendor is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  currentStock: z.number().min(0, 'Current stock must be positive'),
  minStock: z.number().min(0, 'Minimum stock must be positive'),
  description: z.string().optional(),
  priority: z.enum(['urgent', 'important', 'normal', 'low']).default('normal'),
  eisenhowerQuadrant: z.enum(['important-urgent', 'important-not-urgent', 'not-important-urgent', 'not-important-not-urgent']).default('not-important-not-urgent'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  item?: InventoryItem | null;
  onClose: () => void;
}

export const InventoryForm = ({ item, onClose }: InventoryFormProps) => {
  const { toast } = useToast();
  const addItemMutation = useAddInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      category: '',
      vendor: '',
      unitPrice: 0,
      currentStock: 0,
      minStock: 10,
      description: '',
      priority: 'normal',
      eisenhowerQuadrant: 'not-important-not-urgent',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        category: item.category,
        vendor: item.vendor,
        unitPrice: item.unitPrice,
        currentStock: item.currentStock,
        minStock: item.minStock || 10,
        description: item.description || '',
        priority: item.priority || 'normal',
        eisenhowerQuadrant: item.eisenhowerQuadrant || 'not-important-not-urgent',
      });
    }
  }, [item, form]);

  const onSubmit = async (data: InventoryFormData) => {
    try {
      if (item) {
        await updateItemMutation.mutateAsync({
          ...item,
          ...data,
          updatedBy: 'Current User', // This would come from auth context
        });
        toast({
          title: "Success",
          description: "Inventory item updated successfully",
        });
      } else {
        await addItemMutation.mutateAsync({
          name: data.name,
          category: data.category,
          vendor: data.vendor,
          unitPrice: data.unitPrice,
          currentStock: data.currentStock,
          minStock: data.minStock,
          description: data.description,
          priority: data.priority,
          eisenhowerQuadrant: data.eisenhowerQuadrant,
          updatedBy: 'Current User', // This would come from auth context
        });
        toast({
          title: "Success",
          description: "Inventory item added successfully",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save inventory item",
        variant: "destructive",
      });
    }
  };

  const categories = [
    'Materials',
    'Electronics',
    'Recovery',
    'Propulsion',
    'Structural',
    'Tools',
    'Software',
    'Other'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vendor name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eisenhowerQuadrant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eisenhower Quadrant</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quadrant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="important-urgent">Important & Urgent</SelectItem>
                    <SelectItem value="important-not-urgent">Important & Not Urgent</SelectItem>
                    <SelectItem value="not-important-urgent">Not Important & Urgent</SelectItem>
                    <SelectItem value="not-important-not-urgent">Not Important & Not Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter item description (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={addItemMutation.isPending || updateItemMutation.isPending}>
            {item ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
};