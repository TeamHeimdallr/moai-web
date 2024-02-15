import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  selectedTab: string | undefined;

  selectTab: (selectedTab: string | undefined) => void;
}

/**
 * pool info chart selected tab - Volume TVL Fees
 */
export const usePoolInfoChartSelectedTabStore = create<State>()(
  immer(
    logger(set => ({
      name: 'POOL_INFO_CHART_SELECT_TAB_STORE',

      selectedTab: 'volume',
      selectTab: (selectedTab: string | undefined) => set({ selectedTab }),
    }))
  )
);

/**
 * pool info chart selected range - 90 180 365 all
 */
export const usePoolInfoChartSelectedRangeStore = create<State>()(
  immer(
    logger(set => ({
      name: 'POOL_INFO_CHART_SELECT_RANGE_STORE',

      selectedTab: '90',
      selectTab: (selectedTab: string | undefined) => set({ selectedTab }),
    }))
  )
);

export const useLendingAssetSupplyInfoChartSelectedRangeStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LENDING_ASSET_SUPPLY_INFO_CHART_SELECT_RANGE_STORE',

      selectedTab: '24h',
      selectTab: (selectedTab: string | undefined) => set({ selectedTab }),
    }))
  )
);

export const useLendingAssetBorrowInfoChartSelectedRangeStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LENDING_ASSET_BORROW_INFO_CHART_SELECT_RANGE_STORE',

      selectedTab: '24h',
      selectTab: (selectedTab: string | undefined) => set({ selectedTab }),
    }))
  )
);
