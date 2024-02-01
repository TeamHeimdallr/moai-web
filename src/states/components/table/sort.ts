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
 * LP provisions table sorting state in pool detail page
 */
export const useTableLiquidityPoolProvisionSortStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_LIQUIDITY_POOL_PROVISION_SORT_STORE',

      sort: { key: 'time', order: 'desc' },
      setSort: (sort: ITableSort) => set({ sort }),
      resetSort: () => set({ sort: undefined }),
    }))
  )
);

/**
 * liquidity pool table soring state in main page
 */
export const useTableLiquidityPoolSortStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_LIQUIDITY_POOL_SORT_STORE',

      sort: { key: 'value', order: 'desc' },
      setSort: (sort: ITableSort) => set({ sort }),
      resetSort: () => set({ sort: undefined }),
    }))
  )
);

/**
 * my liquidity pool table soring state in main page
 */
export const useTableMyLiquidityPoolSortStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_MY_LIQUIDITY_POOL_SORT_STORE',

      sort: { key: 'balance', order: 'desc' },
      setSort: (sort: ITableSort) => set({ sort }),
      resetSort: () => set({ sort: undefined }),
    }))
  )
);

/**
 * swap histories table soring state in pool detail page
 */
export const useTableSwapHistoriesStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_SWAP_HISTORIES_SORT_STORE',
      sort: { key: 'time', order: 'desc' },
      setSort: (sort: ITableSort) => set({ sort }),
      resetSort: () => set({ sort: undefined }),
    }))
  )
);

export const useTableLendingMySuppliesSortStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_LENDING_MY_SUPPLIES_SORT_STORE',
      sort: { key: 'balance', order: 'desc' },
      setSort: (sort: ITableSort) => set({ sort }),
      resetSort: () => set({ sort: undefined }),
    }))
  )
);

export const useTableLendingAssetsToSupplySortStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_LENDING_ASSETS_TO_SUPPLY_SORT_STORE',
      sort: { key: 'balance', order: 'desc' },
      setSort: (sort: ITableSort) => set({ sort }),
      resetSort: () => set({ sort: undefined }),
    }))
  )
);
