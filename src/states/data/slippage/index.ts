import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../../middleware/logger';

interface State {
  manual: boolean;
  slippage: number | string; // unit %
  setSlippage: (slippage: number | string) => void;
  setManualSlippage: (slippage: number | string) => void;
}

export const useSlippageStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'SLIPPAGE_STORE',

        manual: false,
        slippage: 0.5,
        setSlippage: (slippage: number | string) => set({ manual: false, slippage }),
        setManualSlippage: (slippage: number | string) => set({ manual: true, slippage }),
      }))
    ),
    { name: 'MOAI_SLIPPAGE' }
  )
);
