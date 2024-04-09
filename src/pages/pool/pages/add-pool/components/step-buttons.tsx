import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconBack, IconNext } from '~/assets/icons';

import { ButtonPrimarySmallIconLeading } from '~/components/buttons/primary/small-icon-leading';
import { ButtonPrimarySmallIconTrailing } from '~/components/buttons/primary/small-icon-trailing';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { TOOLTIP_ID } from '~/types';

import { useStep } from '../hooks/use-step';

export const StepButton = () => {
  const { gaAction } = useGAAction();

  const { t } = useTranslation();
  const { step, goNext, goPrev, prevEnabled, nextEnabled } = useStep();

  const handleNext = () => {
    gaAction({
      action: 'xrpl-add-pool-next',
      data: { component: 'xrpl-app-pool', currentStep: step, nextStep: step + 1 },
    });

    goNext();
  };

  const handlePrev = () => {
    gaAction({
      action: 'xrpl-app-pool-prev',
      data: { component: 'xrpl-app-pool', currentStep: step, nextStep: step - 1 },
    });

    goPrev();
  };

  return (
    <Wrapper>
      <ContentWrapper>
        <ButtonPrimarySmallIconLeading
          text={t('Back')}
          icon={<IconBack />}
          disabled={!prevEnabled}
          onClick={handlePrev}
        />
        <ButtonPrimarySmallIconTrailing
          data-tooltip-id={TOOLTIP_ID.ENOUGH_XRP}
          text={t('Next')}
          icon={<IconNext />}
          disabled={!nextEnabled}
          onClick={handleNext}
        />
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full
`;

const ContentWrapper = tw.div`
  w-full flex justify-between items-center
`;
