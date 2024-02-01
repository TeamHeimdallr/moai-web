import { create } from 'zustand';
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
