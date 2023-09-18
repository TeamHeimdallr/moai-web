import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface SelectedLiquidityPoolCompositionTabState {
  selected: string;
  select: (selected: string) => void;
}

export const useSelectedLiquidityPoolCompositionTabStore =
  create<SelectedLiquidityPoolCompositionTabState>()(
    immer(
      logger(set => ({
        name: 'selected-liquidity-pool-composition-tab-store',
        selected: 'total-composition',
        select: (selected: string) => set({ selected }),
      }))
    )
  );
