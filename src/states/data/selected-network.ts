import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { CHAIN } from '~/constants';

import { logger } from '../middleware/logger';

export interface SelectedNetwordState {
  selectedNetwork: string;
  selectNetwork: (name: string) => void;
}

export const useSelectedNetworkStore = create<SelectedNetwordState>()(
  immer(
    logger(set => ({
      name: 'selected-network-store',
      selectedNetwork: CHAIN,
      selectNetwork: (name: string) => set({ selectedNetwork: name }),
    }))
  )
);
