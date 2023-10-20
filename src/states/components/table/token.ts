import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  selectedTokens: string[];
  setSelectedTokens: (selectedTokens: string[]) => void;
}

/**
 * pool composition table select token - Liquidity pools
 */

export const useTablePoolCompositionSelectTokenStore = create<State>()(
  immer(
    logger(set => ({
      name: 'TABLE_POOL_COMPOSITION_SELECT_TOKEN_STORE',
      selectedTokens: [],
      setSelectedTokens: (selectedTokens: string[]) => set({ selectedTokens }),
    }))
  )
);
