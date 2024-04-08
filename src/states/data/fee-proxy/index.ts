import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { ROOT_ASSET_ID } from '~/constants';

import { FeeToken } from '~/components/fee-proxy-selector';

import { logger } from '../../middleware/logger';

interface State {
  feeToken: FeeToken;
  setFeeToken: (feeToken: FeeToken) => void;
  isNativeFee: boolean;
}

export const useFeeTokenStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'FEE_TOKEN_STORE',

        feeToken: {
          name: 'XRP',
          assetId: ROOT_ASSET_ID.XRP,
        },
        setFeeToken: (feeToken: FeeToken) =>
          set({ feeToken, isNativeFee: feeToken.assetId === ROOT_ASSET_ID.XRP }),
        isNativeFee: true,
      }))
    ),
    { name: 'MOAI_FEE_TOKEN' }
  )
);
