import { useEffect, useMemo } from 'react';

import { useConnectedWallet } from '~/hooks/wallets';
import { useSelecteNetworkStore } from '~/states/data';
import { NETWORK } from '~/types';

import { useCampaignStepStore } from '../states/step';

/**
 * step 1: connect wallet xrp
 * step 2: connect wallet evm
 * step 3: bridge
 * step 4: add liquidity
 */
export const useStep = () => {
  const MIN_STEP = 1;
  const MAX_STEP = 4;

  const { xrp } = useConnectedWallet();

  const {
    step,
    stepStatus,
    evmWallet,
    xrpConnectorIdx,
    evmConnectorIdx,
    lastUpdatedAt,
    setStep,
    setStepStatus,
    setEvmWallet,
    setXrpConnectorIdx,
    setEvmConnectorIdx,
    setLastUpdatedAt,
    reset,
  } = useCampaignStepStore();

  const stepStatus1 = stepStatus[0];
  const stepStatus2 = stepStatus[1];
  const stepStatus3 = stepStatus[2];
  const stepStatus4 = stepStatus[3];

  const isInitial = step === MIN_STEP && stepStatus1.status !== 'done' && !xrp.address;

  const prevEnabled = !isInitial && step !== MIN_STEP;
  const nextEnabled = useMemo(() => {
    if (isInitial) return false;

    // in bridge step, always enable next button
    if (step === 3) return true;

    return stepStatus[step - 1].status === 'done';
  }, [isInitial, step, stepStatus]);

  const goPrev = () => {
    if (!prevEnabled || step === MIN_STEP) return;
    setStep(step - 1);
  };
  const goNext = (callback?: () => void) => {
    if (!nextEnabled || step === MAX_STEP) return;
    setStep(step + 1);
    callback?.();
  };

  return {
    MIN_STEP,
    MAX_STEP,

    step,
    stepStatus,
    stepStatus1,
    stepStatus2,
    stepStatus3,
    stepStatus4,

    lastUpdatedAt,

    evmWallet,
    xrpConnectorIdx,
    evmConnectorIdx,

    isInitial,

    prevEnabled,
    nextEnabled,

    goPrev,
    goNext,

    setStepStatus,

    setEvmWallet,
    setXrpConnectorIdx,
    setEvmConnectorIdx,
    setLastUpdatedAt,

    reset,
  };
};

export const useResetStep = () => {
  const { step, evmWallet, stepStatus, setStep, setStepStatuses, setLastUpdatedAt } =
    useCampaignStepStore();

  const { selectNetwork } = useSelecteNetworkStore();
  const { evm, xrp } = useConnectedWallet();

  const stepStatus1 = stepStatus[0];
  const stepStatus2 = stepStatus[1];
  const stepStatus3 = stepStatus[2];

  useEffect(() => {
    if (!xrp.address) {
      setStep(1);
      setStepStatuses([
        { id: 1, status: 'idle' },
        { id: 2, status: 'idle' },
        { id: 3, status: 'idle' },
        { id: 4, status: 'idle' },
      ]);
      setLastUpdatedAt(new Date());
      return;
    }

    if (evm.address) {
      if (xrp.address) {
        if (evmWallet) {
          setStepStatuses([
            { id: 1, status: 'done' },
            { id: 2, status: 'done' },
            { id: 3, status: 'idle' },
            { id: 4, status: 'idle' },
          ]);
          setStep(3);
        } else {
          setStepStatuses([
            { id: 1, status: 'done' },
            { id: 2, status: 'idle' },
            { id: 3, status: 'idle' },
            { id: 4, status: 'idle' },
          ]);
          setStep(2);
        }
      } else {
        setStep(1);
        setStepStatuses([
          { id: 1, status: 'idle' },
          { id: 2, status: 'idle' },
          { id: 3, status: 'idle' },
          { id: 4, status: 'idle' },
        ]);
      }
    } else {
      if (xrp.address) {
        setStepStatuses([
          { id: 1, status: 'done' },
          { id: 2, status: 'idle' },
          { id: 3, status: 'idle' },
          { id: 4, status: 'idle' },
        ]);
        setStep(2);
      } else {
        setStep(1);
        setStepStatuses([
          { id: 1, status: 'idle' },
          { id: 2, status: 'idle' },
          { id: 3, status: 'idle' },
          { id: 4, status: 'idle' },
        ]);
      }
    }
    if (xrp.address && evm.address && stepStatus3.status === 'done') {
      setStepStatuses([
        { id: 1, status: 'done' },
        { id: 2, status: 'done' },
        { id: 3, status: 'done' },
        { id: 4, status: 'idle' },
      ]);
      setStep(4);
    }

    setLastUpdatedAt(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    evm.address,
    xrp.address,
    evmWallet,
    stepStatus1.status,
    stepStatus2.status,
    stepStatus3.status,
  ]);

  useEffect(() => {
    if (step === 3) {
      selectNetwork(NETWORK.XRPL);
      return;
    }

    if (step === 2 || step === 4) {
      selectNetwork(NETWORK.THE_ROOT_NETWORK);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
};
