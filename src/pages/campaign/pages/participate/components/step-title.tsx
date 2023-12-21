import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { useStep } from '../hooks/use-step';

export const StepTitle = () => {
  const { step, stepStatus } = useStep();

  const { t } = useTranslation();

  const currentStepStatus = stepStatus.find(({ id }) => id === step) || stepStatus[0];
  const titleText =
    currentStepStatus.status === 'loading' ? 'step-title-waiting' : `step-title-${step}`;

  return (
    <Wrapper>
      <StepText>Step {step}</StepText>
      <Title>{t(titleText)}</Title>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-4 px-20
  md:(px-0)
`;
const StepText = tw.div`
  font-m-12 text-primary-60
  md:(font-m-14)
`;
const Title = tw.div`
  font-b-20 text-neutral-100
  md:(font-b-24)
  `;
