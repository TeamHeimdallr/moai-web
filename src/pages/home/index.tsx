import tw, { css, styled } from 'twin.macro';

import { AlertBanner } from '~/components/alerts/banner';
import { ButtonPrimarySmallBlack } from '~/components/buttons';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { usePopup } from '~/hooks/components';
import { POPUP_ID } from '~/types';

import { useBanner } from './hooks/components/alert-wallet/use-banner';
import { LiquidityPoolLayout } from './layouts/layout-liquidity-pool';
import { MainLayout } from './layouts/layout-main';

const HomePage = () => {
  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  const { text, connectWallet } = useBanner();

  return (
    <>
      <Wrapper>
        <GnbWrapper banner={!!opened}>
          {opened && (
            <AlertBanner
              text={text}
              button={<ButtonPrimarySmallBlack text="Connect wallet" onClick={connectWallet} />}
            />
          )}
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <MainLayout />
          <ContentWrapper>
            <LiquidityPoolLayout />
          </ContentWrapper>
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
  flex flex-col gap-40 pb-120
`;
interface DivProps {
  banner?: boolean;
}
const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-140` : tw`h-80`,
]);

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-80 px-80`,
  css`
    & > div {
      width: 100%;
      max-width: 1440px;
    }
  `,
]);

export default HomePage;
