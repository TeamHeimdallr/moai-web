import { xorWith } from 'lodash-es';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { IToken } from '~/types';

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

interface XrplPoolState {
  filteredToken: IToken[];
  filterToken: (token: IToken) => void;
}

export const useFilterXrplPoolTokensStore = create<XrplPoolState>()(
  persist(
    immer(
      logger(set => ({
        name: 'FILTER_XRPL_POOL_TOKENS_STORE',
        filteredToken: [],
        filterToken: (token: IToken) =>
          set(state => ({
            filteredToken: xorWith(
              state.filteredToken,
              [token],
              (a, b) => a.address === b.address && a.currency === b.currency
            ),
          })),
      }))
    ),
    { name: 'FILTER_XRPL_POOL_TOKENS_STORE' }
  )
);
