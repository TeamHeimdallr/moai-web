import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

export interface SwapState {
  fromToken: string;
  fromValue: number | string;
  toToken: string;
  toValue: number | string;

  setFromToken: (fromToken: string) => void;
  setFromValue: (fromValue: number | undefined) => void;
  setToToken: (toToken: string) => void;
  setToValue: (toValue: number | undefined) => void;

  resetFromValue: () => void;
  resetAll: () => void;
}

const defaultFrom = 'XRP';
const defaultTo = 'MOI';
export const useSwapStore = create<SwapState>()(
  immer(
    logger(set => ({
      name: 'swap-store',

      fromToken: defaultFrom,
      fromValue: '',
      toToken: defaultTo,
      toValue: '',

      setFromToken: fromToken => set({ fromToken }),
      setFromValue: fromValue => set({ fromValue }),
      setToToken: toToken => set({ toToken }),
      setToValue: toValue => set({ toValue }),

      resetFromValue: () => set({ fromValue: '' }),
      resetToValue: () => set({ toValue: '' }),
      resetAll: () =>
        set({ fromToken: defaultFrom, fromValue: '', toToken: defaultTo, toValue: '' }),
    }))
  )
);
