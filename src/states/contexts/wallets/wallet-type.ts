import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface Base {
  evm: boolean;
  xrpl: boolean;
}
interface State extends Base {
  setWalletType: ({ evm, xrpl }: Base) => void;
}

export const useWalletTypeStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'WALLET_TYPE_STORE',
        evm: true,
        xrpl: true,
        setWalletType: ({ evm, xrpl }: Base) => set({ evm, xrpl }),
      }))
    ),
    { name: 'MOAI_WALLET_TYPE' }
  )
);
