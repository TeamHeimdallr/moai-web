import { XRP_TOKEN_ISSUER } from '~/constants';

import { Entries } from '~/types';

export const getTokenSymbol = (issuer: string) => {
  const entries = Object.entries(XRP_TOKEN_ISSUER) as Entries<typeof XRP_TOKEN_ISSUER>;

  const entry = entries.find(([_, value]) => value === issuer);
  return entry?.[0] ?? '';
};

export const getTokenSymbols = (issuer: string[]) => {
  const entries = Object.entries(XRP_TOKEN_ISSUER) as Entries<typeof XRP_TOKEN_ISSUER>;

  const entry = entries.filter(([_, value]) => issuer.includes(value))?.map(([key]) => key) ?? [];
  return entry;
};
