'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LineItem } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: LineItem) => void;
}

export function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    itemCode: '',
    description: '',
    hsn: '',
    quantity: 1,
    rate: 0,
  });

  const resetForm = () => {
    setFormData({
      itemCode: '',
      description: '',
      hsn: '',
      quantity: 1,
      rate: 0,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateAmount = () => {
    return formData.quantity * formData.rate;
  };

  const calculateGST = () => {
    const amount = calculateAmount();
    return amount * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateAmount() + calculateGST();
  };

  const handleAddItem = () => {
    if (!formData.itemCode || !formData.description || !formData.hsn) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem: LineItem = {
      id: Date.now().toString(),
      itemCode: formData.itemCode,
      description: formData.description,
      hsn: formData.hsn,
      quantity: formData.quantity,
      rate: formData.rate,
      amount: calculateAmount(),
      gst: calculateGST(),
      total: calculateTotal(),
    };

    onAddItem(newItem);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Add Line Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="itemCode" className="text-sm text-gray-600">
                Item Code *
              </Label>
              <Input
                id="itemCode"
                value={formData.itemCode}
                onChange={(e) => handleInputChange('itemCode', e.target.value)}
                placeholder="e.g. ITEM001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hsn" className="text-sm text-gray-600">
                HSN *
              </Label>
              <Input
                id="hsn"
                value={formData.hsn}
                onChange={(e) => handleInputChange('hsn', e.target.value)}
                placeholder="e.g. 9983"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm text-gray-600">
              Description *
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Item description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-sm text-gray-600">
                Qty
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                min="1"
                step="1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate" className="text-sm text-gray-600">
                Rate (₹)
              </Label>
              <Input
                id="rate"
                type="number"
                value={formData.rate}
                onChange={(e) => handleInputChange('rate', Number(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="text-gray-900">₹{calculateAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (18%):</span>
              <span className="text-gray-900">₹{calculateGST().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={handleClose} className="px-4">
            Cancel
          </Button>
          <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700 px-4">
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
