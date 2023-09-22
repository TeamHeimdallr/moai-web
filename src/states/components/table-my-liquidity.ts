import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SortingState } from '~/types';

import { logger } from '../middleware/logger';

export interface TableMyLiquidityState {
  sorting: SortingState | undefined;

  setSorting: (sortingState: SortingState) => void;
  resetSorting: () => void;
}

export const useTableMyLiquidityStore = create<TableMyLiquidityState>()(
  immer(
    logger(set => ({
      name: 'table-my-liquidity-store',

      sorting: { key: 'BALANCE', order: 'desc' },
      setSorting: (sortingState: SortingState) => set({ sorting: sortingState }),
      resetSorting: () => set({ sorting: undefined }),
    }))
  )
);
