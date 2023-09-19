import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface WithdrawLiquidityInputTabState {
  selected: string;
  select: (selected: string) => void;
}

export const useWithdrawLiquidityInputTabStore = create<WithdrawLiquidityInputTabState>()(
  immer(
    logger(set => ({
      name: 'withdraw-liquidity-input-tab-store',
      selected: 'proportional',
      select: (selected: string) => set({ selected }),
    }))
  )
);
