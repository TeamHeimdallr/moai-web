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

export const useCampaignAddLiquidityNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'CAMPAIGN_ADD_LIQUIDITY_NETWORK_FEE_ERROR_STORE',
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

export const useCampaignClaimNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'CAMPAIGN_CLAIM_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useBridgeToXrplNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'BRIDGE_TO_XRPL_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useLendingSupplyNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LENDING_SUPPLY_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useLendingBorrowNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LENDING_BORROW_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useLendingWithdrawNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LENDING_WITHDRAW_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useLendingRepayNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LENDING_REPAY_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useEnterOrExitMarketNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'ENTER_OR_EXIT_MARKET_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useBridgeNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'BRIDGE_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useFarmNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LP_FARM_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);

export const useUnfarmNetworkFeeErrorStore = create<State>()(
  immer(
    logger(set => ({
      name: 'LP_UNFARM_NETWORK_FEE_ERROR_STORE',
      error: false,
      setError: error => set({ error }),
    }))
  )
);
