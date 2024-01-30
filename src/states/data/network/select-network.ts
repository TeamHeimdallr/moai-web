import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { IS_MAINNET } from '~/constants';

import { logger } from '~/states/middleware/logger';
import { NETWORK } from '~/types';

interface State {
  selectedNetwork: NETWORK;
  selectNetwork: (network: NETWORK) => void;
}

export const useSelecteNetworkStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'SELECTED_NETWORK_STORE',
        selectedNetwork: IS_MAINNET ? NETWORK.THE_ROOT_NETWORK : NETWORK.XRPL,
        selectNetwork: (network: NETWORK) => set({ selectedNetwork: network }),
      }))
    ),
    { name: 'MOAI_SELECTED_NETWORK' }
  )
);
