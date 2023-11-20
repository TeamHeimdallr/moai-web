import tw from 'twin.macro';

import { Section1 } from './section1';
import { Section2 } from './section2';

export const Description = () => {
  return (
    <Wrapper>
      <Section1 />
      <Section2 />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full px-20
  xxl:px-80 
`;
