import tw from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { DetailHeader } from '../../layouts/detail-header';
import { DetailLeft } from '../../layouts/detail-left';
import { DetailRight } from '../../layouts/detail-right';

// TODO: switch network alert popup
const PoolDetailMainPage = () => {
  return (
    <>
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentOuterWrapper>
            <DetailHeader />
            <ContentWrapper>
              <DetailLeft />
              <DetailRight />
            </ContentWrapper>
          </ContentOuterWrapper>
        </InnerWrapper>
        <Footer />
      </Wrapper>
    </>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;
const InnerWrapper = tw.div`
  flex flex-col pt-120 pb-120 px-80
`;
const GnbWrapper = tw.div`
  w-full h-80 absolute top-0 left-0 flex-center z-10
`;

const ContentOuterWrapper = tw.div`flex flex-col w-full gap-40`;

const ContentWrapper = tw.div`
  flex gap-40
`;

export default PoolDetailMainPage;
