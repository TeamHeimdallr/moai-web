import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface GemAddressState {
  gemAddress: string;
  setGemAddress: (address: string) => void;
  resetGemAddress: () => void;
}

export const useGemAddressStore = create<GemAddressState>()(
  immer(
    logger(set => ({
      name: 'gem-address-store',
      gemAddress: '',
      setGemAddress: (address: string) => set({ gemAddress: address }),
      resetGemAddress: () => set({ gemAddress: '' }),
    }))
  )
);
