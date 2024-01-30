import tw, { styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { MarketInfo } from './components/market-info';

export const LendingMain = () => {
  useGAPage();

  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  return (
    <Wrapper>
      <GnbWrapper banner={!!opened}>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper banner={!!opened}>
        <ContentOuterWrapper>
          <ContentWrapper>
            {/* market header, info */}
            <ContentInnerWrapper>
              <MarketInfo />
            </ContentInnerWrapper>

            {/* my lists, market lists */}
          </ContentWrapper>
        </ContentOuterWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
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
    flex flex-col pt-120 pb-120 px-20 pt-112
    mlg:(pt-120)
    xl:(px-80 items-center)
  `,
  banner &&
    tw`
      pt-164
      md:(pt-172)
      mlg:(pt-180)
    `,
]);

const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-124 mlg:(h-140)` : tw`h-72 mlg:(h-80)`,
]);

const ContentOuterWrapper = tw.div`
  flex flex-col w-full gap-40 max-w-1440
`;

const ContentWrapper = tw.div`
  flex flex-col gap-40
  xl:(gap-80)
`;

const ContentInnerWrapper = tw.div`
  flex flex-col gap-24
`;

export default LendingMain;
