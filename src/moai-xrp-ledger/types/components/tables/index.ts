import { ReactNode } from 'react';

import { TOKEN } from '~/moai-xrp-root/types/contracts';

import { Composition, TokenInfo } from '..';

export interface LiquidityPoolIds {
  id: string;
  isNew: boolean;
}

export interface LiquidityPoolData {
  id: string;
  assets: TOKEN[];
  compositions: Composition[];
  poolValue: number;
  volume: number;
  apr: number;
  balance: number;
  isNew: boolean;
}

export interface LiquidityPoolTable {
  id: string;
  assets: ReactNode;
  compositions: ReactNode;
  poolValue: ReactNode;
  volume: ReactNode;
  apr: ReactNode;
}

export interface MyLiquidityPoolData {
  id: string;
  assets: TOKEN[];
  compositions: Record<TOKEN, number>;
  pool: Record<TOKEN, number>;
  balance: number;
  apr: number;
  isNew: boolean;
}
export interface MyLiquidityPoolTable {
  id: string;
  assets: ReactNode;
  compositions: ReactNode;
  balance: ReactNode;
  poolValue: ReactNode;
  apr: ReactNode;
}

export interface PoolCompositionData {
  tokenIssuer: string;
  token: string;
  weight: number;
  value: number;
  currentWeight: number;

  userBalance: number;
}
export interface PoolCompositionTable {
  tokenIssuer: string;
  token: ReactNode;
  weight: ReactNode;
  balance: ReactNode;
  value: ReactNode;
  currentWeight: ReactNode;
}
export interface LiquidityProvisionData {
  id: string;
  action: { key: 'deposit' | 'withdraw'; label: string };
  tokens: TokenInfo[];
  value: number;
  time: number;
  liquidityProvider: string;
  txHash: string;
}
export interface LiquidityProvisionTable {
  id: string;
  action: ReactNode;
  tokens: ReactNode;
  value: ReactNode;
  time: ReactNode;
}

export interface SwapData {
  poolId: string;
  trader: string;
  tradeDetail: TokenInfo[];
  value: number;
  time: number;
  txHash: string;
}

export interface SwapTable {
  poolId: string;
  trader: ReactNode;
  tradeDetail: ReactNode;
  value: ReactNode;
  time: ReactNode;
}
