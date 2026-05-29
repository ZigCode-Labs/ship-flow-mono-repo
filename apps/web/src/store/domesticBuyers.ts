import { create } from 'zustand';
import { api } from '@/lib/api';

export type Buyer = {
  id: string;
  companyName: string;
  tradeName?: string | null;
  gstin: string;
  panNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state: string;
  pincode?: string | null;
  contactPerson?: string | null;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  branch?: string | null;
  notes?: string | null;
  status: 'active' | 'inactive' | 'trash';
  createdAt?: string;
  updatedAt?: string;
};

export type BuyerPayload = Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>;

export type CustomerOption = {
  value: string;
  label: string;
  name: string;
  gstin: string;
  state: string;
};

export function buyerToCustomerOption(buyer: Buyer): CustomerOption {
  return {
    value: buyer.id,
    label: buyer.companyName,
    name: buyer.companyName,
    gstin: buyer.gstin,
    state: buyer.state,
  };
}

type DomesticBuyersState = {
  // ── Management page slice: all buyers (all statuses) ──────────────────────
  buyers: Buyer[];
  isLoading: boolean;
  error: string | null;
  setBuyers: (buyers: Buyer[]) => void;
  fetchBuyers: () => Promise<void>;
  addBuyer: (buyer: BuyerPayload) => Promise<Buyer>;
  updateBuyer: (id: string, changes: Partial<BuyerPayload>) => Promise<Buyer>;
  removeBuyer: (id: string) => Promise<void>;
  // ── Selector slice: active buyers only — for invoice / proforma / etc. ────
  activeBuyers: Buyer[];
  isLoadingActive: boolean;
  errorActive: string | null;
  fetchActiveBuyers: () => Promise<void>;
};

export const useDomesticBuyersStore = create<DomesticBuyersState>((set) => ({
  // Management page slice
  buyers: [],
  isLoading: false,
  error: null,
  setBuyers: (buyers) => set({ buyers }),
  fetchBuyers: async () => {
    set({ isLoading: true, error: null });
    try {
      const buyers = await api.get<Buyer[]>('/domestic-buyers');
      set({ buyers, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load buyers',
        isLoading: false,
      });
    }
  },
  addBuyer: async (buyer) => {
    const created = await api.post<Buyer>('/domestic-buyers', {
      ...buyer,
      status: buyer.status ?? 'active',
    });
    set((state) => ({ buyers: [created, ...state.buyers] }));
    return created;
  },
  updateBuyer: async (id, changes) => {
    const updated = await api.patch<Buyer>(`/domestic-buyers/${id}`, changes);
    set((state) => ({
      buyers: state.buyers.map((buyer) => (buyer.id === id ? updated : buyer)),
    }));
    return updated;
  },
  removeBuyer: async (id) => {
    await api.delete(`/domestic-buyers/${id}`);
    set((state) => ({ buyers: state.buyers.filter((buyer) => buyer.id !== id) }));
  },

  // Selector slice
  activeBuyers: [],
  isLoadingActive: false,
  errorActive: null,
  fetchActiveBuyers: async () => {
    set({ isLoadingActive: true, errorActive: null });
    try {
      const activeBuyers = await api.get<Buyer[]>('/domestic-buyers?status=active');
      set({ activeBuyers, isLoadingActive: false });
    } catch (error) {
      set({
        errorActive: error instanceof Error ? error.message : 'Failed to load buyers',
        isLoadingActive: false,
      });
    }
  },
}));
