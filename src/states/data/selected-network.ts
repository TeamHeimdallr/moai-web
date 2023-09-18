import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { CHAIN_ID as ROOT_CHAIN_ID } from '~/constants/constant-chain-root';

import { logger } from '../middleware/logger';

export interface SelectedNetwordState {
  selectedNetwork: number;
  selectNetwork: (id: number) => void;
}

export const useSelectedNetworkStore = create<SelectedNetwordState>()(
  immer(
    logger(set => ({
      name: 'selected-network-store',
      selectedNetwork: ROOT_CHAIN_ID,
      selectNetwork: (id: number) => set({ selectedNetwork: id }),
    }))
  )
);
