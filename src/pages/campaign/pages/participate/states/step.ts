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

  lastUpdatedAt: Date;
  lastSuccessAt: Date;
}
interface State extends Base {
  setStep: (step: number) => void;
  setStepStatus: (step: Step, i: number) => void;
  setStepStatuses: (step: Step[]) => void;
  setLastUpdatedAt: (date: Date) => void;
  setLastSuccessAt: (date: Date) => void;

  setEvmWallet: (wallet: 'evm' | 'fpass' | undefined) => void;

  setXrpConnectorIdx: (xrpConnectorIdx: number) => void;
  setEvmConnectorIdx: (evmConnectorIdx: number) => void;

  reset: () => void;
}

const initialStepStatus = Array.from({ length: 4 }).map(
  (_, i) => ({ id: i + 1, status: 'idle' }) as Step
);
const now = new Date();
export const useCampaignStepStore = create<State>()(
  persist(
    immer(
      logger(set => ({
        name: 'CAMPAIGN_STEP_STORE',

        step: 1,
        stepStatus: initialStepStatus,

        evmWallet: undefined,

        xrpConnectorIdx: -1,
        evmConnectorIdx: -1,

        lastUpdatedAt: now,
        lastSuccessAt: now,

        setStep: (step: number) => set({ step }),
        setStepStatus: (stepStatus: Step, i: number) =>
          set(
            produce<State>(state => {
              state.stepStatus[i] = stepStatus;
            })
          ),
        setStepStatuses: (stepStatus: Step[]) => set({ stepStatus }),

        setEvmWallet: (wallet: 'evm' | 'fpass' | undefined) => set({ evmWallet: wallet }),
        setXrpConnectorIdx: (xrpConnectorIdx: number) => set({ xrpConnectorIdx }),
        setEvmConnectorIdx: (evmConnectorIdx: number) => set({ evmConnectorIdx }),

        setLastUpdatedAt: (date: Date) => set({ lastUpdatedAt: date }),
        setLastSuccessAt: (date: Date) => set({ lastSuccessAt: date }),

        reset: () => set({ step: 1, stepStatus: initialStepStatus }),
      }))
    ),
    { name: 'MOAI_CAMPAIGN' }
  )
);
