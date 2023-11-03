import tw, { styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { DetailHeader } from '../../layouts/detail-header';
import { DetailLeft } from '../../layouts/detail-left';
import { DetailRight } from '../../layouts/detail-right';

const PoolDetailMainPage = () => {
  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  return (
    <>
      <Wrapper>
        <GnbWrapper banner={!!opened}>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper banner={!!opened}>
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
interface DivProps {
  banner?: boolean;
}
const InnerWrapper = styled.div<DivProps>(({ banner }) => [
  tw`  
    flex flex-col pt-120 pb-120 px-80
  `,
  banner ? tw`pt-180` : tw`pt-120`,
]);

const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-140` : tw`h-80`,
]);

const ContentOuterWrapper = tw.div`flex flex-col w-full gap-40`;

const ContentWrapper = tw.div`
  flex gap-40
`;

export default PoolDetailMainPage;
