import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

export interface SwapState {
  fromToken: string;
  fromValue: number | undefined;
  toToken: string;

  setFromToken: (fromToken: string) => void;
  setFromValue: (fromValue: number | undefined) => void;
  setToToken: (toToken: string) => void;

  resetFromValue: () => void;
  resetAll: () => void;
}

export const useSwapStore = create<SwapState>()(
  immer(
    logger(set => ({
      name: 'swap-store',

      fromToken: 'MOAI',
      fromValue: undefined,
      toToken: 'USDC',

      setFromToken: fromToken => set({ fromToken }),
      setFromValue: fromValue => set({ fromValue }),
      setToToken: toToken => set({ toToken }),

      resetFromValue: () => set({ fromValue: -1 }),
      resetAll: () => set({ fromToken: 'MOAI', fromValue: -1, toToken: 'USDC' }),
    }))
  )
);
