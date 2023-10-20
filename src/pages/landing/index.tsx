import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { Contents } from './components/contents';
import { Gnb } from './components/gnb';

const LandingPage = () => {
  return (
    <Wrapper>
      <Gnb />
      <Contents />
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-full flex flex-col justify-between bg-landing bg-cover bg-center pb-40`;

export default LandingPage;
