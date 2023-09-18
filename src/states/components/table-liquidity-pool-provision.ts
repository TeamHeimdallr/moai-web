import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SortingState } from '~/types/components';

import { logger } from '../middleware/logger';

export interface TableLiquidityPoolProvisionState {
  sorting: SortingState | undefined;

  setSorting: (sortingState: SortingState) => void;
  resetSorting: () => void;
}

export const useTableLiquidityPoolProvisionStore = create<TableLiquidityPoolProvisionState>()(
  immer(
    logger(set => ({
      name: 'table-liquidity-pool-provision-store',

      sorting: { key: 'TIME', order: 'desc' },
      setSorting: (sortingState: SortingState) => set({ sorting: sortingState }),
      resetSorting: () => set({ sorting: undefined }),
    }))
  )
);
