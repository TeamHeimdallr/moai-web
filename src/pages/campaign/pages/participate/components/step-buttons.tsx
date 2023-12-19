import { useMemo } from 'react';
import tw from 'twin.macro';

import { IconBack, IconNext } from '~/assets/icons';

import { ButtonPrimarySmallIconLeading } from '~/components/buttons/primary/small-icon-leading';
import { ButtonPrimarySmallIconTrailing } from '~/components/buttons/primary/small-icon-trailing';

import { TooltipEnoughXrp } from '~/pages/campaign/components/tooltip-enough-xrp';
import { useCampaignStepStore } from '~/pages/campaign/pages/participate/states/step';

import { useConnectedWallet } from '~/hooks/wallets';
import { TOOLTIP_ID } from '~/types';

export const StepButton = () => {
  const { step, setStep } = useCampaignStepStore();
  const { xrp, evm } = useConnectedWallet();

  const nextDisabled = useMemo(() => {
    if (step === 1) {
      return !xrp.isConnected;
    }
    if (step === 2) {
      return !evm.isConnected;
    }
    // TODO: add condition step3, step4
  }, [evm.isConnected, step, xrp.isConnected]);

  return (
    <Wrapper>
      <ContentWrapper>
        <ButtonPrimarySmallIconLeading
          text={'Back'}
          icon={<IconBack />}
          disabled={step === 1}
          onClick={() => setStep('negative')}
        />
        <ButtonPrimarySmallIconTrailing
          data-tooltip-id={TOOLTIP_ID.ENOUGH_XRP}
          text={'Next'}
          icon={<IconNext />}
          disabled={nextDisabled || step === 4}
          onClick={() => setStep('positive')}
        />
      </ContentWrapper>
      {step === 3 && <TooltipEnoughXrp />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full
`;

const ContentWrapper = tw.div`
  w-full flex justify-between items-center
`;
