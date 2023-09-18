import { Address } from 'viem';

export enum TOKEN {
  USDC = 'USDC',
  USDT = 'USDT',
  WETH = 'WETH',
  MOAI = 'MOAI',
  ROOT = 'ROOT',
  XRP = 'XRP',
  SYLO = 'SYLO',
  ASTO = 'ASTO',
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
  balancesMap?: Record<string, TokenBalanceInfo>;
  balancesArray?: TokenBalanceInfo[];
}

export type PoolBalance = [Address[], bigint[], bigint];
