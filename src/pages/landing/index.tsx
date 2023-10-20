import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { LandingBody } from './components/body';
import { LandingGnb } from './components/gnb';

const LandingPage = () => {
  return (
    <Wrapper>
      <LandingGnb />
      <LandingBody />
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-full flex flex-col justify-between bg-landing bg-cover bg-center pb-40`;

export default LandingPage;
