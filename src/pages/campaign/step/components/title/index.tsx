import tw from 'twin.macro';

import { useCampaignStepStore } from '~/pages/campaign/states/step';

export const StepperTitle = () => {
  const { step, isLoading } = useCampaignStepStore();
  const network = step === 1 ? 'XRPL' : 'the Root Network';
  const titleText =
    step === 1 || step === 2
      ? isLoading
        ? 'Waiting to connect...'
        : `Connect to ${network} wallet`
      : step === 3
      ? 'Bridge your $XRP'
      : 'Add liquidity';
  return (
    <Wrapper>
      <StepText>Step {step}</StepText>
      <Title>{titleText}</Title>
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full flex flex-col gap-4`;
const StepText = tw.div`font-m-14 text-primary-60`;
const Title = tw.div`font-b-24 text-neutral-100`;
