import { produce } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface Step {
  id: number;
  status: 'idle' | 'loading' | 'done';
}
interface Base {
  step: number;
  stepStatus: Step[];
}
interface State extends Base {
  setStep: (step: number) => void;
  setStepStatus: (step: Step, i: number) => void;
  setStepStatuses: (step: Step[]) => void;

  reset: () => void;
}

const initialStepStatus = Array.from({ length: 3 }).map(
  (_, i) => ({ id: i + 1, status: 'idle' }) as Step
);
export const useXrplPoolAddStepStore = create<State>()(
  immer(
    logger(set => ({
      name: 'XRPL_ADD_POOL_STATE',

      step: 1,
      stepStatus: initialStepStatus,

      setStep: (step: number) => set({ step }),
      setStepStatus: (stepStatus: Step, i: number) =>
        set(
          produce<State>(state => {
            state.stepStatus[i] = stepStatus;
          })
        ),
      setStepStatuses: (stepStatus: Step[]) => set({ stepStatus }),

      reset: () => set({ step: 1, stepStatus: initialStepStatus }),
    }))
  )
);
