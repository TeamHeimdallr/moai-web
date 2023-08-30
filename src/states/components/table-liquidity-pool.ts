import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

interface SortingState {
  key: string;
  order: 'asc' | 'desc';
}
export interface TableLiquidityState {
  sorting: SortingState | undefined;

  setSorting: (sortingState: SortingState) => void;
  resetSorting: () => void;
}

export const useTableLiquidityStore = create<TableLiquidityState>()(
  immer(
    logger(set => ({
      name: 'table-liquidity-store',

      sorting: undefined,
      setSorting: (sortingState: SortingState) => set({ sorting: sortingState }),
      resetSorting: () => set({ sorting: undefined }),
    }))
  )
);
