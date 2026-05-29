export const DEFAULT_EXCHANGE_RATE = '93.6100';

const LIVE_EXCHANGE_RATE_SEQUENCE = ['94.1700', '94.2500', '94.0800'] as const;

export const getInitialLiveExchangeRate = (): string => LIVE_EXCHANGE_RATE_SEQUENCE[0];

export const getNextExchangeRate = (currentRate: string): string => {
  const currentIndex = LIVE_EXCHANGE_RATE_SEQUENCE.findIndex((rate) => rate === currentRate);

  if (currentIndex === -1) {
    return LIVE_EXCHANGE_RATE_SEQUENCE[0];
  }

  return LIVE_EXCHANGE_RATE_SEQUENCE[(currentIndex + 1) % LIVE_EXCHANGE_RATE_SEQUENCE.length];
};

export const getExchangeRateToastDescription = (rate: string): string => `1 USD = \u20B9${rate}`;
