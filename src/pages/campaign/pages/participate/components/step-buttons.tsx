import tw from 'twin.macro';

import { IconBack, IconNext } from '~/assets/icons';

import { ButtonPrimarySmallIconLeading } from '~/components/buttons/primary/small-icon-leading';
import { ButtonPrimarySmallIconTrailing } from '~/components/buttons/primary/small-icon-trailing';

import { TooltipEnoughXrp } from '~/pages/campaign/components/tooltip-enough-xrp';

import { TOOLTIP_ID } from '~/types';

import { useStep } from '../hooks/use-step';

export const StepButton = () => {
  const { step, setStepStatus, goNext, goPrev, prevEnabled, nextEnabled } = useStep();

  const handleNext = () => {
    if (step === 3) {
      goNext(() => setStepStatus({ id: 3, status: 'done' }, 2));
      return;
    }
    goNext();
  };

  return (
    <Wrapper>
      <ContentWrapper>
        <ButtonPrimarySmallIconLeading
          text={'Back'}
          icon={<IconBack />}
          disabled={!prevEnabled}
          onClick={goPrev}
        />
        <ButtonPrimarySmallIconTrailing
          data-tooltip-id={TOOLTIP_ID.ENOUGH_XRP}
          text={'Next'}
          icon={<IconNext />}
          disabled={!nextEnabled}
          onClick={handleNext}
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
