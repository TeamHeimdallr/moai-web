import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SortingState } from '~/types';

import { logger } from '../middleware/logger';

export interface TableLiquidityPoolState {
  sorting: SortingState | undefined;

  setSorting: (sortingState: SortingState) => void;
  resetSorting: () => void;
}

export const useTableLiquidityPoolStore = create<TableLiquidityPoolState>()(
  immer(
    logger(set => ({
      name: 'table-liquidity-store',

      sorting: { key: 'POOL_VALUE', order: 'desc' },
      setSorting: (sortingState: SortingState) => set({ sorting: sortingState }),
      resetSorting: () => set({ sorting: undefined }),
    }))
  )
);
