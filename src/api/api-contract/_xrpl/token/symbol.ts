import { XRP_TOKEN_ISSUER } from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { Entries, NETWORK } from '~/types';

export const getTokenSymbol = (network: NETWORK, issuer: string) => {
  const isXrp = network === NETWORK.XRPL;
  if (!isXrp) return '';

  const entries = Object.entries(XRP_TOKEN_ISSUER) as Entries<typeof XRP_TOKEN_ISSUER>;

  const entry = entries.find(([_, value]) => value === issuer);
  return entry?.[0] ?? '';
};

export const getTokenSymbols = (network: NETWORK, issuer: string[]) => {
  const isXrp = network === NETWORK.XRPL;
  if (!isXrp) return [];

  const entries = Object.entries(XRP_TOKEN_ISSUER) as Entries<typeof XRP_TOKEN_ISSUER>;

  const entry = entries.filter(([_, value]) => issuer.includes(value))?.map(([key]) => key) ?? [];
  return entry;
};

export const useTokenSymbols = (issuer: string[]) => {
  const { isXrp } = useNetwork();
  if (!isXrp) return { data: [] as string[] };

  const entries = Object.entries(XRP_TOKEN_ISSUER) as Entries<typeof XRP_TOKEN_ISSUER>;

  const entry = entries.filter(([_, value]) => issuer.includes(value))?.map(([key]) => key) ?? [];
  return {
    data: entry as string[],
  };
};
