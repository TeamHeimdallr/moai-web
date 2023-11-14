import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { Gnb } from '../components/gnb';
import { LiquidityPoolLayout } from '../layouts/layout-liquidity-pool';

import { Contents } from './contents';

const LandingPage = () => {
  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <Contents />

      {/* <LiquidityPoolLayout /> */}
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative w-full h-full flex flex-col justify-between bg-no-repeat bg-campaign bg-cover px-20
  xxl:(px-80)
`;
const GnbWrapper = tw.div`w-full absolute top-0 left-0 flex-center flex-col z-10`;
export default LandingPage;
