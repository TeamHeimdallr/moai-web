import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { Gnb } from '../components/gnb';
import { MyVoyage } from '../layouts/layout-my-voyage';

import { Contents } from './contents';

const LandingPage = () => {
  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <Contents />

      <MyVoyage />
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full h-full flex flex-col justify-between
`;
const GnbWrapper = tw.div`w-full absolute top-0 left-0 flex-center flex-col z-10`;
export default LandingPage;
