import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface Base {
  isConnected: boolean;
  address: string;
  keyPath: string;
}
interface State extends Base {
  setInfo: ({ isConnected, address, keyPath }: Partial<Base>) => void;
}

export const useDcentWalletStore = create<State>()(
  immer(
    logger(set => ({
      name: 'DCENT_WALLET_STORE',
      isConnected: false,
      address: '',
      keyPath: '',

      setInfo: ({ isConnected, address, keyPath }: Partial<Base>) => {
        return set({ isConnected, address, keyPath });
      },
    }))
  )
);
