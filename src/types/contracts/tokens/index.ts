import { Address } from 'viem';

export enum TOKEN {
  USDC = 'USDC',
  USDT = 'USDT',
  WETH = 'WETH',
  MOAI = 'MOAI',
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
  valueUSD: number;
  symbol: string;
}

export interface TokenBalanceInfoAll {
  balancesMap?: Record<TOKEN, TokenBalanceInfo>;
  balancesArray?: TokenBalanceInfo[];
}

export type PoolBalance = [Address[], bigint[], bigint];
