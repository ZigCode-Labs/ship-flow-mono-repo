'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, Wrench, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { StatCard, StatCardsGrid } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { DynamicForm } from '@/components/dynamic-form';
import formConfig from './form-config.json';

interface JobWorkType {
  id: string;
  name: string;
  description?: string;
}

const EMPTY_FORM = {
  name: '',
  description: '',
};

export default function JobWorkTypesPage() {
  const [types, setTypes] = React.useState<JobWorkType[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  const handleAdd = () => {
    setEditingId(null);
    setFormKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleEdit = (type: JobWorkType) => {
    setEditingId(type.id);
    setFormKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: Record<string, any>) => {
    if (editingId) {
      setTypes((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...data } : t)));
      toast.success('Job work type updated');
    } else {
      setTypes((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: data.name, description: data.description },
      ]);
      toast.success('Job work type added');
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setTypes((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    toast.success('Job work type removed');
  };

  // Calculate stat values
  const totalTypes = types.length;
  const _withDescriptionCount = types.filter((t) => t.description).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header with title and add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Job Work Types</h1>
          <p className="text-sm text-muted-foreground">
            Define categories for outsourced job work (e.g., Printing, Embroidery, Stitching).
          </p>
        </div>
        <Button size="lg" className="gap-1.5 rounded-[5px]" onClick={handleAdd}>
          <Plus data-icon="inline-start" />
          Add Type
        </Button>
      </div>

      <StatCardsGrid className="lg:grid-cols-2">
        <StatCard label="Total Types" value={totalTypes} icon={Wrench} variant="blue" />
        <StatCard label="Active" value={totalTypes} icon={Wrench} variant="green" />
      </StatCardsGrid>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search job work types by name or description..."
          className="rounded-[5px] pl-9"
        />
      </div>

      {/* Empty state */}
      {types.length === 0 ? (
        <EmptyState
          title="No Job Work Types Yet"
          description="Add types like Printing, Embroidery, Dyeing, etc."
          buttonText="Add Type"
          icon={Wrench}
          onAdd={handleAdd}
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-[5px] border border-border bg-white">
          {types.map((type) => (
            <div key={type.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{type.name}</span>
                {type.description ? (
                  <span className="truncate text-xs text-muted-foreground">{type.description}</span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-[5px]"
                  onClick={() => handleEdit(type)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-[5px] text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(type.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-[5px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Job Work Type' : 'Add Job Work Type'}</DialogTitle>
          </DialogHeader>

          <DynamicForm
            key={formKey}
            formId="job-work-type-form"
            config={{
              ...formConfig,
              onSubmit: handleFormSubmit,
            }}
            initialValues={editingId ? types.find((t) => t.id === editingId) : EMPTY_FORM}
          />

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-[5px]"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="job-work-type-form" className="rounded-[5px]">
              {editingId ? 'Save Changes' : 'Add Type'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm rounded-[5px]">
          <DialogHeader>
            <DialogTitle>Remove Job Work Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job work type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
