import tw from 'twin.macro';

import { IconBack, IconNext } from '~/assets/icons';

import { ButtonPrimarySmallIconLeading } from '~/components/buttons/primary/small-icon-leading';
import { ButtonPrimarySmallIconTrailing } from '~/components/buttons/primary/small-icon-trailing';
import { LoadingStep } from '~/components/loadings';

import { StepContents } from '../layouts/layout-step';
import { useCampaignStepStore } from '../states/step';

const StepPage = () => {
  const { step, setStep } = useCampaignStepStore();

  // TODO : waiting connect text
  const titleText =
    step === 1
      ? 'Connect to XRPL wallet'
      : step === 2
      ? 'Connect to the Root Network wallet'
      : step === 3
      ? 'Bridge your $XRP'
      : 'Add liquidity';

  return (
    <Wrapper>
      {/* TODO : connect wallet loading */}
      <LoadingStep totalSteps={4} step={step} isLoading={false} />
      <Content>
        <MoveStepWrapper>
          <ButtonPrimarySmallIconLeading
            text={'Back'}
            icon={<IconBack />}
            disabled={step === 1}
            onClick={() => setStep('negative')}
          />
          <ButtonPrimarySmallIconTrailing
            text={'Next'}
            icon={<IconNext />}
            disabled={step === 4}
            onClick={() => setStep('positive')}
          />
        </MoveStepWrapper>

        <TextWrapper>
          <StepText>Step {step}</StepText>
          <Title>{titleText}</Title>
        </TextWrapper>

        <StepContents />
      </Content>
    </Wrapper>
  );
};

const Wrapper = tw.div`flex flex-col items-center p-80 gap-40`;
const Content = tw.div`w-455 flex flex-col items-center gap-24`;
const MoveStepWrapper = tw.div`w-full flex justify-between items-center`;
const TextWrapper = tw.div`w-full flex flex-col gap-4`;
const StepText = tw.div`font-m-14 text-primary-60`;
const Title = tw.div`font-b-24 text-neutral-100`;
export default StepPage;
