import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type Org = {
  id: string;
  name: string;
  slug: string;
  tradeName?: string | null;
  onboardingDone: boolean;
  members?: { role: OrgRole }[];
};

type ActiveOrgState = {
  activeOrg: Org | null;
  isHydrated: boolean;
  setActiveOrg: (org: Org | null) => void;
  markHydrated: () => void;
};

export const useActiveOrgStore = create<ActiveOrgState>()(
  persist(
    (set) => ({
      activeOrg: null,
      isHydrated: false,
      setActiveOrg: (org) => set({ activeOrg: org }),
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'active-org-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeOrg: state.activeOrg }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

// --- Onboarding wizard step state ---

export type OrgSetupData = {
  // Step 1
  name: string;
  tradeName?: string;
  country: string;
  // Step 2
  iecCode?: string;
  gstNumber?: string;
  panNumber?: string;
  cinNumber?: string;
  // Step 3
  bankName?: string;
  bankAccountNo?: string;
  bankIFSC?: string;
  bankBranch?: string;
  swiftCode?: string;
  // Step 4 — files handled separately via upload
  logoUrl?: string;
  signatureUrl?: string;
  // Step 5
  countryOfOrigin?: string;
  portOfLoading?: string;
  placeOfReceipt?: string;
  // Step 6
  itemCodePrefix?: string;
  itemCodeDigits?: number;
};

type OrgSetupState = {
  currentStep: number;
  orgId: string | null;
  data: Partial<OrgSetupData>;
  setStep: (step: number) => void;
  setOrgId: (id: string) => void;
  mergeData: (patch: Partial<OrgSetupData>) => void;
  reset: () => void;
};

export const useOrgSetupStore = create<OrgSetupState>()(
  persist(
    (set) => ({
      currentStep: 1,
      orgId: null,
      data: {},
      setStep: (step) => set({ currentStep: step }),
      setOrgId: (id) => set({ orgId: id }),
      mergeData: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
      reset: () => set({ currentStep: 1, orgId: null, data: {} }),
    }),
    {
      name: 'org-setup-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
