import { NETWORK } from '~/types';

export const getNetworkAbbr = (network?: NETWORK) => {
  if (network === NETWORK.THE_ROOT_NETWORK) return 'trn';
  if (network === NETWORK.EVM_SIDECHAIN) return 'evm';
  if (network === NETWORK.XRPL) return 'xrpl';

  return '';
};
export const getNetworkFull = (networkAbbr?: string): NETWORK | undefined => {
  if (networkAbbr === 'trn') return NETWORK.THE_ROOT_NETWORK;
  if (networkAbbr === 'evm') return NETWORK.EVM_SIDECHAIN;
  if (networkAbbr === 'xrpl') return NETWORK.XRPL;
};
