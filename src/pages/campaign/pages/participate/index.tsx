import tw from 'twin.macro';

import { Step } from './components/step';
import { StepTitle } from './components/step-title';

const ParticipatePage = () => {
  return (
    <Wrapper>
      <Step />
      <StepTitle />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-455 flex-center flex-col py-40 gap-24
  md:(py-80)
`;

export default ParticipatePage;
