import tw from 'twin.macro';

import { useStep } from '../hooks/use-step';

import { StepButton } from './step-buttons';
import { StepProgress } from './step-progress';

export const Step = () => {
  const { isInitial } = useStep();

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
