import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  selectedTab: string | undefined;

  selectTab: (selectedTab: string | undefined) => void;
}

/**
 * withdraw liquidity input group tab - proportional | single
 */
export const useWithdrawLiquidityInputGroupTabStore = create<State>()(
  immer(
    logger(set => ({
      name: 'WITHDRAW_LIQUIDITY_INPUT_GROUP_TAB_STORE',

      selectedTab: 'proportional',
      selectTab: (selectedTab: string | undefined) => set({ selectedTab }),
    }))
  )
);
