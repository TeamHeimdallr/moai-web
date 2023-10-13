import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface Base {
  isInstalled: boolean;
  isConnected: boolean;
  address: string;
}
interface State extends Base {
  setInfo: ({ isInstalled, isConnected, address }: Partial<Base>) => void;
}

export const useXrplWalletStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'GEM_WALLET_STORE',
        isInstalled: false,
        isConnected: false,
        address: '',

        setInfo: ({ isInstalled, isConnected, address }: Partial<Base>) =>
          set({ isInstalled, isConnected, address }),
      }))
    ),
    { name: 'MOAI_GEM_WALLET' }
  )
);
