import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { IToken } from '~/types';

interface State {
  token: IToken | undefined;
  setToken: (token: IToken | undefined) => void;
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
