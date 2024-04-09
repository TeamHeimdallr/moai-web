import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { IPoolTokenList, IToken } from '~/types';

interface Base {
  token1?: IPoolTokenList | null;
  token2?: IPoolTokenList | null;

  token1Detail?: IToken | null;
  token2Detail?: IToken | null;

  initialFee?: number;
}
interface State extends Base {
  setToken1: (token1?: IPoolTokenList | null) => void;
  setToken2: (token2?: IPoolTokenList | null) => void;

  setToken1Detail: (token1?: IToken | null) => void;
  setToken2Detail: (token2?: IToken | null) => void;

  setInitialFee: (fee: number) => void;

  reset: () => void;
}

export const useXrplPoolAddTokenPairStore = create<State>()(
  immer(
    logger(set => ({
      name: 'XRPL_ADD_POOL_TOKEN_PAIR_STATE',

      token1: null,
      token2: null,

      token1Detail: null,
      token2Detail: null,

      initialFee: undefined,

      setToken1: (token1?: IPoolTokenList | null) => set({ token1 }),
      setToken2: (token2?: IPoolTokenList | null) => set({ token2 }),

      setToken1Detail: (token1?: IToken | null) => set({ token1Detail: token1 }),
      setToken2Detail: (token2?: IToken | null) => set({ token2Detail: token2 }),

      setInitialFee: (fee: number) => set({ initialFee: fee }),

      reset: () =>
        set({ token1: null, token2: null, token1Detail: null, token2Detail: null, initialFee: 0 }),
    }))
  )
);
