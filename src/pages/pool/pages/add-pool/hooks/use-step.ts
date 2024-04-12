import { useMemo } from 'react';

import { useConnectedWallet } from '~/hooks/wallets';

import { useXrplPoolAddStepStore } from '../states/step';

/**
 * step 1: select pair
 * step 2: set initial trading fee
 * step 3: set initial liquidity
 */
export const useStep = () => {
  const MIN_STEP = 1;
  const MAX_STEP = 3;

  const { xrp } = useConnectedWallet();

  const {
    step,
    stepStatus,

    setStep,
    setStepStatus,

    reset,
  } = useXrplPoolAddStepStore();

  const stepStatus1 = stepStatus[0];
  const stepStatus2 = stepStatus[1];
  const stepStatus3 = stepStatus[2];

  const isInitial = step === MIN_STEP && stepStatus1.status !== 'done' && !xrp.address;

  const prevEnabled = true;
  const nextEnabled = useMemo(() => {
    if (isInitial) return false;
    if (step === MAX_STEP) return false;

    return stepStatus[step - 1].status === 'done';
  }, [isInitial, step, stepStatus]);

  const goPrev = () => {
    if (!prevEnabled || step === MIN_STEP) return;
    setStep(step - 1);
  };

  const goNext = () => {
    if (!nextEnabled || step === MAX_STEP) return;
    setStep(step + 1);
  };

  return {
    MIN_STEP,
    MAX_STEP,

    step,
    stepStatus,
    stepStatus1,
    stepStatus2,
    stepStatus3,

    isInitial,

    prevEnabled,
    nextEnabled,

    goPrev,
    goNext,

    setStepStatus,
    reset,
  };
};
