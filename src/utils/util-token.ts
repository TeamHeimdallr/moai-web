import { Address, zeroAddress } from 'viem';

import { EVM_TOKEN_ADDRESS } from '~/constants';

import { NETWORK } from '~/types';

interface IsNativeTokenProps {
  network: NETWORK;
  symbol?: string;
  address?: Address;
}
export const isNativeToken = ({ network, symbol, address }: IsNativeTokenProps) => {
  if (network === NETWORK.EVM_SIDECHAIN) return symbol === 'XRP' || address === zeroAddress;
  if (network === NETWORK.XRPL) return symbol === 'XRP';
  return false;
};

export const getWrappedTokenAddress = (network: NETWORK) => {
  if (network === NETWORK.EVM_SIDECHAIN) return EVM_TOKEN_ADDRESS[NETWORK.EVM_SIDECHAIN].WXRP;
  return undefined;
};

export const getTokenDecimal = (network: NETWORK, symbol?: string) => {
  if (network === NETWORK.THE_ROOT_NETWORK) {
    if (symbol === 'XRP' || symbol === 'ROOT') return 6;
    return 18;
  }
  if (network === NETWORK.EVM_SIDECHAIN) return 18;
  if (network === NETWORK.XRPL) return 6;
  return 6;
};
