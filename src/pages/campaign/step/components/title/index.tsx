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

const Wrapper = tw.div`w-full flex flex-col gap-4 px-20
  md:px-0
`;
const StepText = tw.div`
  font-m-12 text-primary-60
  md:font-m-14
`;
const Title = tw.div`
  font-b-20 text-neutral-100
  md:font-b-24
  `;
