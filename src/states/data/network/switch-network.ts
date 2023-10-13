import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  requireSwitchNetwork: boolean;

  setRequireSwitchNetwork: (requireSwitchNetwork: boolean) => void;
  resetRequireSwitchNetwork: () => void;
}

export const useSwitchNetworkStore = create<State>()(
  immer(
    logger(set => ({
      name: 'REQUIRE_SWITCH_NETWORK_STORE',

      requireSwitchNetwork: false,

      setRequireSwitchNetwork: (requireSwitchNetwork: boolean) => set({ requireSwitchNetwork }),
      resetRequireSwitchNetwork: () => set({ requireSwitchNetwork: false }),
    }))
  )
);
