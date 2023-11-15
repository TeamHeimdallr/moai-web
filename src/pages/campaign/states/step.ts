import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  step: number;

  setStep: (step: number) => void;
  resetStep: () => void;
}

/**
 * swap histories table soring state in pool detail page
 */
export const useCampaignStepStore = create<State>()(
  immer(
    logger(set => ({
      step: 1,
      setStep: (step: number) => set({ step }),
      resetStep: () => set({ step: 0 }),
    }))
  )
);
