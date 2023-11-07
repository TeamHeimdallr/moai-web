import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { Gnb } from '../components/gnb';

import { Contents } from './contents';

const LandingPage = () => {
  return (
    <Wrapper>
      <Gnb />
      <Contents />
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-full flex flex-col justify-between bg-campaign bg-cover`;

export default LandingPage;
