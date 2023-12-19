import tw from 'twin.macro';

import { useCampaignStepStore } from '~/pages/campaign/pages/participate/states/step';

import { useConnectedWallet } from '~/hooks/wallets';

import { StepButton } from './step-buttons';
import { StepProgress } from './step-progress';

export const Step = () => {
  const { step } = useCampaignStepStore();
  const { xrp } = useConnectedWallet();

  const isInitial = step === 1 && !xrp.isConnected;

  return (
    <Wrapper>
      <StepProgress />
      {!isInitial && <StepButton />}
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-full flex-center flex-col gap-40 px-20
  md:px-0
`;
