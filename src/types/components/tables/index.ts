import { ReactNode } from 'react';
import { Address } from 'viem';

import { TOKEN } from '~/types/contracts';

import { TokenInfo } from '..';

export interface LiquidityPoolData {
  id: string;
  assets: TOKEN[];
  composition: Record<TOKEN, number>;
  pool: Record<TOKEN, number>;
  volume: number;
  apr: number;
  isNew: boolean;
}

export interface LiquidityPoolTable {
  id: string;
  assets: ReactNode;
  composition: ReactNode;
  poolValue: ReactNode;
  volume: ReactNode;
  apr: ReactNode;
}

export interface MyLiquidityData {
  id: string;
  assets: TOKEN[];
  composition: Record<TOKEN, number>;
  pool: Record<TOKEN, number>;
  balance: number;
  apr: number;
  isNew: boolean;
}
export interface MyLiquidityTable {
  id: string;
  assets: ReactNode;
  composition: ReactNode;
  balance: ReactNode;
  poolValue: ReactNode;
  apr: ReactNode;
}

export interface SortingState {
  key: string;
  order: 'asc' | 'desc';
}

export interface PoolCompositionData {
  tokenAddress: Address;
  token: TOKEN;
  weight: number;
  balance: number;
  value: number;
  currentWeight: number;
}
export interface PoolCompositionTable {
  tokenAddress: string;
  token: ReactNode;
  weight: ReactNode;
  balance: ReactNode;
  value: ReactNode;
  currentWeight: ReactNode;
}
export interface LiquidityProvisionData {
  id: number;
  action: { key: 'add' | 'withdraw'; label: string };
  tokens: TokenInfo[];
  value: number;
  time: string;
}
export interface LiquidityProvisionTable {
  id: number;
  action: ReactNode;
  tokens: ReactNode;
  value: ReactNode;
  time: ReactNode;
}

export interface SwapData {
  id: number;
  trader: string;
  tradeDetail: TokenInfo[];
  value: number;
  time: string;
}
export interface SwapTable {
  id: number;
  trader: ReactNode;
  tradeDetail: ReactNode;
  value: ReactNode;
  time: ReactNode;
}
