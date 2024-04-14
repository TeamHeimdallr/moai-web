import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { IPoolTokenList } from '~/types';

interface State {
  selectedTokens: IPoolTokenList[];
  setSelectedTokens: (selectedTokens: IPoolTokenList[]) => void;
}

/**
 * pool composition table select token - Liquidity pools
 */

export const useTablePoolCompositionSelectTokenStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_POOL_COMPOSITION_SELECT_TOKEN_STORE',
      selectedTokens: [],
      setSelectedTokens: (selectedTokens: IPoolTokenList[]) => set({ selectedTokens }),
    }))
  )
);
