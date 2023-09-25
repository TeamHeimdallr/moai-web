import { Address } from 'viem';

export interface TokenInfo {
  name: string;
  balance: number;
  price: number;
  value: number;
}

export interface Composition extends TokenInfo {
  // pool token
  tokenAddress: Address;
  weight: number;
}

export interface PoolInfo {
  id: Address;

  // lp token
  tokenName: string;
  tokenAddress: Address;
  tokenTotalSupply: number;

  compositions: Composition[];

  formattedBalance: string;
  formattedValue: string;
  formattedVolume: string;
  formattedApr: string;
  formattedFees: string;

  balance: number;
  value: number;
  volume: number;
  apr: number;
  fees: number;
}
