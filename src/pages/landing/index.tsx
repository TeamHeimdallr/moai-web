import tw from 'twin.macro';

import { Contents } from './components/contents';
import { Gnb } from './components/gnb';

const LandingPage = () => {
  return (
    <Wrapper>
      <InnerWrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <Contents />
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`w-full h-full bg-landing bg-cover bg-center`;
const InnerWrapper = tw.div`relative w-full h-full overflow-y-auto`;
const GnbWrapper = tw.div`fixed top-0 w-full z-1`;

export default LandingPage;
