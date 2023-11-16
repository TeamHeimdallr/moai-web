import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  step: number;

  setStep: (type: 'positive' | 'negative') => void;
  resetStep: () => void;
}

/**
 * swap histories table soring state in pool detail page
 */
export const useCampaignStepStore = create<State>()(
  immer(
    logger(set => ({
      step: 1,
      setStep: (type: 'positive' | 'negative') => {
        set(state => {
          if (type === 'positive') {
            state.step += 1;
          } else if (type === 'negative') {
            state.step -= 1;
          }
        });
      },
      resetStep: () => set({ step: 0 }),
    }))
  )
);
