import { ReactNode } from 'react';

import { TOKEN } from '~/types/contracts';

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
