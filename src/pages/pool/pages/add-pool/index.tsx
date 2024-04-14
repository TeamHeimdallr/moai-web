import { useEffect } from 'react';
import tw, { styled } from 'twin.macro';

import { Gnb } from '~/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useForceNetwork } from '~/hooks/contexts/use-network';
import { POPUP_ID } from '~/types';

import { Step } from './components/step';
import { StepTitle } from './components/step-title';
import { useStep } from './hooks/use-step';
import { SelectPair } from './layouts/layout-step1-select-pair';
import { Fee } from './layouts/layout-step2-fee';
import { AddLp } from './layouts/layout-step3-add-lp';
import { useXrplPoolAddTokenPairStore } from './states/token-pair';

const AddPoolPage = () => {
  useGAPage();
  useForceNetwork({
    enableParamsNetwork: true,
    enableChangeAndRedirect: true,
    callCallbackUnmounted: true,
  });

  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);

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
    <Wrapper banner={!!opened}>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>

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
    w-full h-full flex flex-col justify-start items-center py-40 gap-40
    md:(py-80)
  `,
  banner && tw`pt-80 md:(pt-100)`,
]);

const GnbWrapper = tw.div`
  w-full absolute top-0 left-0 flex-center flex-col z-10
`;
const StepWrapper = tw.div`
  w-455 flex-center flex-col gap-24 pb-80
`;

export default AddPoolPage;
