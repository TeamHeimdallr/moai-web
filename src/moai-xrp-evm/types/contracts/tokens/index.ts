import { Address } from 'viem';

export enum TOKEN {
  MOAI = 'MOAI',
  XRP = 'XRP',
  WXRP = 'WXRP',
  USD = 'USD',
  WETH = 'WETH',
}

export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface TokenBalanceInfo {
  value: number;
  balance: number;
  name: string;
}

export interface TokenBalanceInfoAll {
  balancesMap?: Record<string, TokenBalanceInfo>;
  balancesArray?: TokenBalanceInfo[];
}

// token addresses, balance
export type PoolBalance = [Address[], bigint[], bigint];
