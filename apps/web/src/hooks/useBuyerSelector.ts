import { useEffect, useMemo, useRef } from 'react';
import {
  useDomesticBuyersStore,
  buyerToCustomerOption,
  type CustomerOption,
} from '@/store/domesticBuyers';

export type { CustomerOption };

type BuyerSelectorResult = {
  customerOptions: CustomerOption[];
  isLoading: boolean;
  error: string | null;
};

/**
 * Returns the list of active domestic buyers as CustomerOption objects,
 * along with loading and error states. Triggers a fetch on first mount
 * only if no active buyers are cached yet.
 *
 * Reusable across Tax Invoice, Proforma, Credit Notes, and any other
 * form that needs a buyer selector.
 */
export function useBuyerSelector(): BuyerSelectorResult {
  const activeBuyers = useDomesticBuyersStore((state) => state.activeBuyers);
  const isLoadingActive = useDomesticBuyersStore((state) => state.isLoadingActive);
  const errorActive = useDomesticBuyersStore((state) => state.errorActive);
  const fetchActiveBuyers = useDomesticBuyersStore((state) => state.fetchActiveBuyers);
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (activeBuyers.length === 0 && !isLoadingActive && !didFetchRef.current) {
      didFetchRef.current = true;
      void fetchActiveBuyers();
    }
  }, [activeBuyers.length, isLoadingActive, fetchActiveBuyers]);

  const customerOptions = useMemo(
    () => activeBuyers.map(buyerToCustomerOption),
    [activeBuyers],
  );

  return {
    customerOptions,
    isLoading: isLoadingActive,
    error: errorActive,
  };
}
