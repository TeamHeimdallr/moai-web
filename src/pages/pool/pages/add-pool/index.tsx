import { useEffect } from 'react';
import tw, { styled } from 'twin.macro';

import { useGAPage } from '~/hooks/analaystics/ga-page';

import { Step } from './components/step';
import { StepTitle } from './components/step-title';
import { useStep } from './hooks/use-step';
import { SelectPair } from './layouts/layout-step1-select-pair';
import { Fee } from './layouts/layout-step2-fee';
import { AddLp } from './layouts/layout-step3-add-lp';
import { useXrplPoolAddTokenPairStore } from './states/token-pair';

const AddPoolPage = () => {
  useGAPage();

  const { step, reset: resetStep } = useStep();
  const { reset } = useXrplPoolAddTokenPairStore();

  useEffect(() => {
    return () => {
      resetStep();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper>
      <StepWrapper>
        <Step />
        <StepTitle />

        {step === 1 && <SelectPair />}
        {step === 2 && <Fee />}
        {step === 3 && <AddLp />}
      </StepWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  banner?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ banner }) => [
  tw`
    w-full h-full flex items-start justify-center py-40
    md:(py-80)
  `,
  banner && tw`pt-80 md:(pt-100)`,
]);
const StepWrapper = tw.div`
  w-455 flex-center flex-col gap-24 pb-80
`;

export default AddPoolPage;
