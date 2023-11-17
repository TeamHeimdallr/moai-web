import tw from 'twin.macro';

import { useCampaignStepStore } from '~/pages/campaign/states/step';

import { useConnectedWallet } from '~/hooks/wallets';

import { MoveStep } from '../move-step';
import { StepProgress } from '../step-progress';

export const Stepper = () => {
  const { step } = useCampaignStepStore();
  const { xrp } = useConnectedWallet();

  return (
    <Wrapper>
      <StepProgress />

      {(step !== 1 || xrp.isConnected) && <MoveStep />}
    </Wrapper>
  );
};
const Wrapper = tw.div`w-full flex-center flex-col gap-40`;
