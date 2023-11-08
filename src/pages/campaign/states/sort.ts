import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { ITableSort } from '~/types';

interface State {
  sort: ITableSort | undefined;

  setSort: (sort: ITableSort) => void;
  resetSort: () => void;
}

/**
 * swap histories table soring state in pool detail page
 */
export const useTablePendingStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_PENDING_SORT_STORE',
      sort: { key: 'TIME', order: 'desc' },
      setSort: (sort: ITableSort) => set({ sort }),
      resetSort: () => set({ sort: undefined }),
    }))
  )
);
