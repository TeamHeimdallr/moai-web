import tw from 'twin.macro';

import { Step } from './components/step';
import { StepTitle } from './components/step-title';
import { useStep } from './hooks/use-step';
import { LayoutStep1WalletconnectXrp } from './layouts/layout-step1-wallet-connect-xrp';
import { LayoutStep2WalletconnectEvm } from './layouts/layout-step2-wallet-connect-evm';
import { LayoutStep3Bridge } from './layouts/layout-step3-bridge';
import { LayoutStep4AddLiquidity } from './layouts/layout-step4-add-liquidity';

const ParticipatePage = () => {
  const { step } = useStep();

  return (
    <Wrapper>
      <StepWrapper>
        <Step />
        <StepTitle />

        {step === 1 && <LayoutStep1WalletconnectXrp />}
        {step === 2 && <LayoutStep2WalletconnectEvm />}
        {step === 3 && <LayoutStep3Bridge />}
        {step === 4 && <LayoutStep4AddLiquidity />}
      </StepWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-full flex items-start justify-center py-40
  md:(py-80)
`;
const StepWrapper = tw.div`
  w-455 flex-center flex-col gap-24
`;

export default ParticipatePage;
