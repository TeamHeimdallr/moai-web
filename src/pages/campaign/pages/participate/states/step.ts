import { produce } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface Step {
  id: number;
  status: 'idle' | 'loading' | 'done';
}
interface Base {
  step: number;
  stepStatus: Step[];

  evmWallet: 'evm' | 'fpass' | undefined;

  xrpConnectorIdx: number;
  evmConnectorIdx: number;
}
interface State extends Base {
  setStep: (step: number) => void;
  setStepStatus: (step: Step, i: number) => void;

  setEvmWallet: (wallet: 'evm' | 'fpass' | undefined) => void;

  setXrpConnectorIdx: (xrpConnectorIdx: number) => void;
  setEvmConnectorIdx: (evmConnectorIdx: number) => void;

  reset: () => void;
}

const initialStepStatus = Array.from({ length: 4 }).map(
  (_, i) => ({ id: i + 1, status: 'idle' }) as Step
);
export const useCampaignStepStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'CAMAPIGN_STEP_STORE',

        step: 1,
        stepStatus: initialStepStatus,

        evmWallet: undefined,

        xrpConnectorIdx: -1,
        evmConnectorIdx: -1,

        setStep: (step: number) => set({ step }),
        setStepStatus: (stepStatus: Step, i: number) =>
          set(
            produce<State>(state => {
              state.stepStatus[i] = stepStatus;
            })
          ),

        setEvmWallet: (wallet: 'evm' | 'fpass' | undefined) => set({ evmWallet: wallet }),
        setXrpConnectorIdx: (xrpConnectorIdx: number) => set({ xrpConnectorIdx }),
        setEvmConnectorIdx: (evmConnectorIdx: number) => set({ evmConnectorIdx }),

        reset: () => set({ step: 1, stepStatus: initialStepStatus }),
      }))
    ),
    { name: 'MOAI_CAMAPIGN' }
  )
);
