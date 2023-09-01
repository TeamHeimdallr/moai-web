import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

export interface SwapState {
  fromToken: string;
  fromValue: number | string;
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
      fromValue: '',
      toToken: 'WETH',

      setFromToken: fromToken => set({ fromToken }),
      setFromValue: fromValue => set({ fromValue }),
      setToToken: toToken => set({ toToken }),

      resetFromValue: () => set({ fromValue: '' }),
      resetAll: () => set({ fromToken: 'MOAI', fromValue: '', toToken: 'USDC' }),
    }))
  )
);
