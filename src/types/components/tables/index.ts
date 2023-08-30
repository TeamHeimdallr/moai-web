import { ReactNode } from 'react';

export interface LiquidityPoolTable {
  assets: ReactNode;
  composition: ReactNode;
  poolValue: ReactNode;
  volumn: ReactNode;
  apr: ReactNode;
}

export interface MyLiquidityTable {
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
