import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface SwitchNetworkState {
  needSwitchNetwork: boolean;

  setNeedSwitchNetwork: (need: boolean) => void;
  reset: () => void;
}

export const useSwitchNetworkStore = create<SwitchNetworkState>()(
  immer(
    logger(set => ({
      name: 'switch-network-store',

      needSwitchNetwork: false,
      setNeedSwitchNetwork: (need: boolean) => set({ needSwitchNetwork: need }),
      reset: () => set({ needSwitchNetwork: false }),
    }))
  )
);
