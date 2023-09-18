import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface SelectedLiquidityPoolProvisionTabState {
  selected: string;
  select: (selected: string) => void;
}

export const useSelectedLiquidityPoolProvisionTabStore =
  create<SelectedLiquidityPoolProvisionTabState>()(
    immer(
      logger(set => ({
        name: 'selected-liquidity-pool-provision-tab-store',
        selected: 'total-provision',
        select: (selected: string) => set({ selected }),
      }))
    )
  );
