import { NETWORK } from '~/types';

export const getNetworkAbbr = (network: NETWORK) => {
  if (network === NETWORK.THE_ROOT_NETWORK) return 'trn';
  if (network === NETWORK.EVM_SIDECHAIN) return 'evm';
  if (network === NETWORK.XRPL) return 'xrpl';

  return '';
};
