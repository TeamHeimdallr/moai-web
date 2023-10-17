import tw from 'twin.macro';

import { LandingBody } from './components/body';
import { LandingFooter } from './components/footer';
import { LandingGnb } from './components/gnb';

const LandingPage = () => {
  return (
    <Wrapper>
      <LandingGnb />
      <LandingBody />
      <LandingFooter />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-full flex flex-col justify-between bg-landing bg-cover bg-center pb-40`;

export default LandingPage;
