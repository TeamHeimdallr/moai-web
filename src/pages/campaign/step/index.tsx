import tw from 'twin.macro';

import { StepContents } from '../layouts/layout-step';

import { Stepper } from './components/stepper';
import { StepperTitle } from './components/title';

const StepPage = () => {
  return (
    <Wrapper>
      <Stepper />

      <StepperTitle />

      <StepContents />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-455 flex-center flex-col py-40 gap-24
  md:py-80
  `;

export default StepPage;
