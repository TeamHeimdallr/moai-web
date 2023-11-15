import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { IToken } from '~/types';

export interface SwapState {
  fromToken: IToken | undefined;
  toToken: IToken | undefined;

  fromInput: number | string;

  setFromToken: (fromToken?: IToken) => void;
  setToToken: (toToken?: IToken) => void;

  setFromInput: (fromInput: number | undefined) => void;
  resetFromValue: () => void;

  resetAll: () => void;
}

export const useSwapStore = create<SwapState>()(
  immer(
    logger(set => ({
      name: 'swap-store',

      fromToken: undefined,
      toToken: undefined,

      fromInput: '',

      setFromToken: fromToken => set({ fromToken }),
      setToToken: toToken => set({ toToken }),

      setFromInput: fromInput => set({ fromInput }),
      resetFromValue: () => set({ fromInput: '' }),

      resetAll: () =>
        set({
          fromToken: undefined,
          toToken: undefined,
          fromInput: '',
        }),
    }))
  )
);
