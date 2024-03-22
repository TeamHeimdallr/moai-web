import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  showAllPools: boolean;
  setShowAllPools: (showAllPools: boolean) => void;
}

export const useShowAllPoolsStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'SHOW_ALL_POOLS_STORE',
        showAllPools: false,
        setShowAllPools: (showAllPools: boolean) => set({ showAllPools }),
      }))
    ),
    { name: 'MOAI_SHOW_ALL_POOLS' }
  )
);
