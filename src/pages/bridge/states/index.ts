import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { IToken } from '~/types';

interface State {
  from: string;
  to: string;
  selectFrom: (network: string) => void;
  selectTo: (network: string) => void;
}

export const useSelecteNetworkStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'BRIDGE_SELECTED_NETWORK_STORE',
        from: 'ETHEREUM',
        to: 'THE_ROOT_NETWORK',
        selectFrom: (network: string) => set({ from: network }),
        selectTo: (network: string) => set({ to: network }),
      }))
    ),
    { name: 'MOAI_BRIDGE_SELECTED_NETWORK' }
  )
);

type OmittedToken = Omit<IToken, 'id' | 'network' | 'isLpToken' | 'isCexListed'>;
interface TokenState {
  token: OmittedToken;
  selectToken: (token: OmittedToken) => void;
}

export const useSelecteTokenStore = create<TokenState>()(
  immer(
    logger(set => ({
      name: 'BRIDGE_SELECTED_TOKEN_STORE',
      token: { symbol: '', address: '', currency: '' },
      selectToken: (token: OmittedToken) => set({ token }),
    }))
  )
);
