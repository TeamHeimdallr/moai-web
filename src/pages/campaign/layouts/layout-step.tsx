import { useEffect } from 'react';

import { useConnectedWallet } from '~/hooks/wallets';

import { StepConnectWallet } from '../components/connect-wallet/step-connect-wallet';
import { useCampaignStepStore } from '../states/step';

export const StepContents = () => {
  const { step, setStep } = useCampaignStepStore();
  const { xrp, fpass } = useConnectedWallet();

  useEffect(() => {
    if (xrp?.isConnected) setStep('positive');
    if (fpass?.isConnected) setStep('positive');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{step < 3 ? <StepConnectWallet step={step} /> : null}</>;
};
