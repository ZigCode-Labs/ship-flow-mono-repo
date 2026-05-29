'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, Pencil, Trash2, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { StatCard, StatCardsGrid } from '@/components/ui/stat-card';

const locationSchema = z.object({
  locationName: z.string().min(1, 'Location name is required'),
  description: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface DeliveryLocation extends LocationFormValues {
  id: string;
  isDefault: boolean;
}

export default function DeliveryLocationsPage() {
  const [locations, setLocations] = React.useState<DeliveryLocation[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      locationName: '',
      description: '',
    },
    mode: 'onChange',
  });

  const handleAdd = () => {
    setEditingId(null);
    reset({ locationName: '', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (location: DeliveryLocation) => {
    setEditingId(location.id);
    reset({
      locationName: location.locationName,
      description: location.description || '',
    });
    setDialogOpen(true);
  };

  const handleSetDefault = (id: string) => {
    setLocations((prev) => prev.map((loc) => ({ ...loc, isDefault: loc.id === id })));
    toast.success('Default location updated');
  };

  const onSubmit = (data: LocationFormValues) => {
    if (editingId) {
      setLocations((prev) => prev.map((loc) => (loc.id === editingId ? { ...loc, ...data } : loc)));
      toast.success('Location updated');
    } else {
      const isFirst = locations.length === 0;
      setLocations((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          isDefault: isFirst,
          ...data,
        },
      ]);
      toast.success('Delivery location added');
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const deletingDefault = locations.find((l) => l.id === deleteId)?.isDefault ?? false;
    const remaining = locations.filter((l) => l.id !== deleteId);

    if (deletingDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
    }
    setLocations(remaining);
    setDeleteId(null);
    toast.success('Delivery location removed');
  };

  const totalLocations = locations.length;
  const activeCount = locations.filter((l) => l.isDefault).length || totalLocations;

  return (
    <div className="flex flex-col gap-6">
      {/* Header with title and add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Delivery Locations</h1>
          <p className="text-sm text-muted-foreground">
            Manage your delivery addresses (warehouses, factories, offices).
          </p>
        </div>
        <Button className="gap-1.5 rounded-[5px]" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Location
        </Button>
      </div>

      {/* Stat Cards */}
      <StatCardsGrid className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard label="Total Locations" value={totalLocations} icon={MapPin} variant="blue" />
        <StatCard label="Active" value={activeCount} icon={MapPin} variant="green" />
      </StatCardsGrid>

      {/* Empty state or Table */}
      {locations.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-[5px] border border-dashed border-border bg-white p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-[5px] bg-muted">
            <MapPin className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No Delivery Locations Yet</p>
          <p className="text-sm text-muted-foreground">
            Add your warehouse, factory, or office address
          </p>
          <Button variant="outline" className="mt-1 gap-1.5 rounded-[5px]" onClick={handleAdd}>
            <Plus className="size-4" />
            Add Location
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[5px] border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Location Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{loc.locationName}</span>
                      {loc.isDefault && (
                        <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
                          <Star className="size-2.5 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {loc.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!loc.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="rounded-[5px]"
                          title="Set as default"
                          onClick={() => handleSetDefault(loc.id)}
                        >
                          <Star className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className={cn('rounded-[5px]', loc.isDefault && 'ml-7')}
                        onClick={() => handleEdit(loc)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-[5px] text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(loc.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-[5px] p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold">
              {editingId ? 'Edit Delivery Location' : 'Add Delivery Location'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Location Name Field */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationName" className="text-sm font-medium">
                Location Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationName"
                {...register('locationName')}
                placeholder="e.g., Main Warehouse, Factory Unit 2"
                className="rounded-[5px]"
              />
              {errors.locationName && (
                <p className="text-xs text-red-500">{errors.locationName.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Address or additional details"
                rows={4}
                className="rounded-[5px] resize-y"
              />
            </div>

            {/* Buttons */}
            <DialogFooter className="gap-2 sm:space-x-0 mt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-[5px] px-4"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-[5px] px-4" disabled={!isValid}>
                {editingId ? 'Save Changes' : 'Add Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm rounded-[5px]">
          <DialogHeader>
            <DialogTitle>Remove Location</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this delivery location? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button variant="outline" className="rounded-[5px]" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-[5px]" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
