import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  error: boolean;
  setError: (error: boolean) => void;
}

export const useAddLiquidityNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'ADD_LIQUIDITY_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useWithdrawLiquidityNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'WITHDRAW_LIQUIDITY_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useSwapNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'SWAP_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useApproveNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'APPROVE_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);
