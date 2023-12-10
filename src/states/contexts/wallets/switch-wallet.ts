import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  selectedWallet: 'fpass' | 'evm';
  selectWallet: (type: 'fpass' | 'evm') => void;
  toggleWallet: () => void;
}

export const useTheRootNetworkSwitchWalletStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'THE_ROOT_NETWORK_SWITCH_WALLET_STORE',
        selectedWallet: 'fpass',
        selectWallet: type => set({ selectedWallet: type }),
        toggleWallet: () =>
          set(state => ({ selectedWallet: state.selectedWallet === 'fpass' ? 'evm' : 'fpass' })),
      }))
    ),
    { name: 'MOAI_THE_ROOT_NETWORK_SWITCH_WALLET' }
  )
);
