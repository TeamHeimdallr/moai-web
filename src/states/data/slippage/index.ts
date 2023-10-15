import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../../middleware/logger';

interface State {
  slippage: number; // unit %
  setSlippage: (slippage: number) => void;
}

export const useSlippageStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'SLIPPAGE_STORE',

        slippage: 0.5,
        setSlippage: (slippage: number) => set({ slippage }),
      }))
    ),
    { name: 'MOAI_SLIPPAGE' }
  )
);
