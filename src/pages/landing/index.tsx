import tw from 'twin.macro';

import { Footer } from '~/components/footer';

import { Contents } from './components/contants';
import { Gnb } from './components/gnb';

const LandingPage = () => {
  return (
    <Wrapper>
      <InnerWrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <ContentWrapper>
          <ContentInnerWrapper>
            <Contents />
            <ContentShadow />
          </ContentInnerWrapper>

          <Footer />
        </ContentWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-full bg-landing bg-cover bg-center
`;
const InnerWrapper = tw.div`
  relative w-full h-full overflow-y-auto
`;
const GnbWrapper = tw.div`
  fixed top-0 w-full z-1
`;

const ContentWrapper = tw.div`
  relative flex flex-col h-full gap-300 justify-between items-center
`;
const ContentInnerWrapper = tw.div`
  relative w-full
`;
const ContentShadow = tw.div`
  w-full
  h-380
  smd:(h-488)
  mlg:(h-600)
`;

export default LandingPage;
