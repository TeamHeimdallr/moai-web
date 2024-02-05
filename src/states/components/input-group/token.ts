import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { ITokenComposition } from '~/types';

type Token = ITokenComposition & {
  balance: number;
  balanceRaw: bigint;
};
interface State {
  token: Token | undefined;
  setToken: (token: Token | undefined) => void;
}
export const useAddLiquidityTokenStore = create<State>()(
  immer(
    logger(set => ({
      name: 'add-liquidity-token-store',

      token: undefined,
      setToken: token => set({ token }),
    }))
  )
);
