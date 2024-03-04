import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  selectedWaveId: number;
  selectWaveId: (id: number) => void;
}

export const useRewardSelectWaveIdStore = create<State>()(
  immer(
    logger(set => ({
      name: 'REWARD_SELECTED_WAVE',

      selectedWaveId: 0,
      selectWaveId: (id: number) => set({ selectedWaveId: id }),
    }))
  )
);
