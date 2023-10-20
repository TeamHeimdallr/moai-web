import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  selectedTab: string | undefined;

  selectTab: (selectedTab: string | undefined) => void;
}

/**
 * pool composition table select tab - total-composition | my-composition
 */
export const useTablePoolCompositionSelectTabStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_POOL_COMPOSITION_SELECT_TAB_STORE',

      selectedTab: 'total-composition',
      selectTab: (selectedTab: string | undefined) => set({ selectedTab }),
    }))
  )
);

/**
 * pool liquidity provision table select tab - total-provision | my-provision
 */
export const useTablePoolLiquidityProvisionSelectTabStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_POOL_LIQUIDITY_PROVISION_SELECT_TAB_STORE',

      selectedTab: 'total-provision',
      selectTab: (selectedTab: string | undefined) => set({ selectedTab }),
    }))
  )
);
