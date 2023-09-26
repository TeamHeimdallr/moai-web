import { Entries } from '~/types';

import { ISSUER } from '~/moai-xrp-ledger/constants';

export const getTokenSymbol = (issuer: string) => {
  const entries = Object.entries(ISSUER) as Entries<typeof ISSUER>;

  const entry = entries.find(([_, value]) => value === issuer);
  return entry?.[0] ?? '';
};

export const getTokenSymbols = (issuer: string[]) => {
  const entries = Object.entries(ISSUER) as Entries<typeof ISSUER>;

  const entry = entries.filter(([_, value]) => issuer.includes(value))?.map(([key]) => key) ?? [];
  return entry;
};
