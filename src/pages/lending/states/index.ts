import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  type: 'supply' | 'borrow';
  setType: (type: 'supply' | 'borrow') => void;
}

export const useSupplyBorrowTabStore = create<State>()(
  immer(
    logger(set => ({
      name: 'SUPPLY_BORROW_TAB_STORE',
      type: 'supply',
      setType: type => set({ type }),
    }))
  )
);
interface ShowZeroBalanceState {
  showZeroBalances: boolean;
  setShowZeroBalances: () => void;
}

export const useShowZeroBalanceAssetsStore = create<ShowZeroBalanceState>()(
  persist(
    immer(
      logger(set => ({
        name: 'SHOW_LENDING_SHOW_ZERO_BALANCE_ASSETS_STORE',
        showZeroBalances: false,
        setShowZeroBalances: () => set(prev => ({ showZeroBalances: !prev.showZeroBalances })),
      }))
    ),
    { name: 'MOAI_SHOW_LENDING_ZERO_ASSETS' }
  )
);
