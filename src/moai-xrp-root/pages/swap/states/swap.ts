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

const defaultFrom = 'ROOT';
const defaultTo = 'XRP';
export const useSwapStore = create<SwapState>()(
  immer(
    logger(set => ({
      name: 'swap-store',

      fromToken: defaultFrom,
      fromValue: '',
      toToken: defaultTo,

      setFromToken: fromToken => set({ fromToken }),
      setFromValue: fromValue => set({ fromValue }),
      setToToken: toToken => set({ toToken }),

      resetFromValue: () => set({ fromValue: '' }),
      resetAll: () => set({ fromToken: defaultFrom, fromValue: '', toToken: defaultTo }),
    }))
  )
);