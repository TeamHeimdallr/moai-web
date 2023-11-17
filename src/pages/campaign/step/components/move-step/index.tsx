import { useMemo } from 'react';
import tw from 'twin.macro';

import { IconBack, IconNext } from '~/assets/icons';

import { ButtonPrimarySmallIconLeading } from '~/components/buttons/primary/small-icon-leading';
import { ButtonPrimarySmallIconTrailing } from '~/components/buttons/primary/small-icon-trailing';

import { useCampaignStepStore } from '~/pages/campaign/states/step';

import { useConnectedWallet } from '~/hooks/wallets';

export const MoveStep = () => {
  const { step, setStep } = useCampaignStepStore();
  const { xrp, evm } = useConnectedWallet();
  const nextDisabled = useMemo(() => {
    if (step === 1) {
      return !xrp.isConnected;
    }
    if (step === 2) {
      return !evm.isConnected;
    }
    // TODP : add condition step3, step4
  }, [evm.isConnected, step, xrp.isConnected]);
  return (
    <Wrapper>
      <ButtonPrimarySmallIconLeading
        text={'Back'}
        icon={<IconBack />}
        disabled={step === 1}
        onClick={() => setStep('negative')}
      />
      <ButtonPrimarySmallIconTrailing
        text={'Next'}
        icon={<IconNext />}
        disabled={nextDisabled || step === 4}
        onClick={() => setStep('positive')}
      />
    </Wrapper>
  );
};
const Wrapper = tw.div`w-full flex justify-between items-center`;
