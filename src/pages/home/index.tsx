import tw, { css, styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { SelectWalletPopup } from '~/components/wallet-selection';

import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types';

import { LiquidityPoolLayout } from './layouts/layout-liquidity-pool';
import { MainLayout } from './layouts/layout-main';

const HomePage = () => {
  const { opened } = usePopup(POPUP_ID.WALLET);

  return (
    <>
      <Wrapper>
        <GnbWrapper>
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
      {opened && <SelectWalletPopup />}
    </>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;

const InnerWrapper = tw.div`
  flex flex-col gap-40 pb-120
`;

const GnbWrapper = tw.div`
  w-full h-80 absolute top-0 left-0 flex-center z-10
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-80 px-96`,
  css`
    & > div {
      width: 100%;
      max-width: 1440px;
    }
  `,
]);

export default HomePage;
