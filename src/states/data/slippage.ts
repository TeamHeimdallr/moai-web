import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface SlippageState {
  slippageId: number;
  setSlippageId: (id: number) => void;
}

export const useSlippageStore = create<SlippageState>()(
  immer(
    logger(set => ({
      name: 'slippage-store',
      slippageId: 0,
      setSlippageId: (id: number) => set({ slippageId: id }),
    }))
  )
);
