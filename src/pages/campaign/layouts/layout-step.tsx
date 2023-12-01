import { useEffect } from 'react';
import tw from 'twin.macro';

import { useConnectedWallet } from '~/hooks/wallets';

import { StepConnectWallet } from '../components/connect-wallet/step-connect-wallet';
import { useCampaignStepStore } from '../states/step';
import Bridge from '../step/components/bridge';

export const StepContents = () => {
  const { step, setStep } = useCampaignStepStore();
  const { xrp, fpass } = useConnectedWallet();

  useEffect(() => {
    if (!xrp.isConnected) return;
    setStep('positive');
    if (!fpass.address) return;
    setStep('positive');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Wrapper>{step < 3 ? <StepConnectWallet /> : step === 3 ? <Bridge /> : null}</Wrapper>;
};
const Wrapper = tw.div`relative w-full`;
