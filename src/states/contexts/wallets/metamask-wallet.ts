import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface Base {
  isConnected: boolean;
  address: string;
}
interface State extends Base {
  setInfo: ({ isConnected, address }: Partial<Base>) => void;
}

export const useMetamaskWalletStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'METAMASK_WALLET_STORE',
        isConnected: false,
        address: '',

        setInfo: ({ isConnected, address }: Partial<Base>) => set({ isConnected, address }),
      }))
    ),
    { name: 'MOAI_METAMASK_WALLET' }
  )
);
