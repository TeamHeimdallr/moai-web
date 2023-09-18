import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface SelectedLiquidityProvisionTabState {
  selected: string;
  select: (selected: string) => void;
}

export const useSelectedLiquidityProvisionTabStore = create<SelectedLiquidityProvisionTabState>()(
  immer(
    logger(set => ({
      name: 'selected-liquidity-provision-tab-store',
      selected: 'total-provision',
      select: (selected: string) => set({ selected }),
    }))
  )
);
