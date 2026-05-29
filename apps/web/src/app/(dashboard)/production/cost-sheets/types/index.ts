export interface LineItem {
  id: string;
  itemCode: string;
  itemName: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  gst: number;
  amount: number;
  total: number;
}
