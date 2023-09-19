import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SortingState } from '~/types/components';

import { logger } from '../middleware/logger';

export interface TableSwapHistoriesState {
  sorting: SortingState | undefined;

  setSorting: (sortingState: SortingState) => void;
  resetSorting: () => void;
}

export const useTableSwapHistoriesStore = create<TableSwapHistoriesState>()(
  immer(
    logger(set => ({
      name: 'table-swap-histories-store',

      sorting: { key: 'TIME', order: 'desc' },
      setSorting: (sortingState: SortingState) => set({ sorting: sortingState }),
      resetSorting: () => set({ sorting: undefined }),
    }))
  )
);
