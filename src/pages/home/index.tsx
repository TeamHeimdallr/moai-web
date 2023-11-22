import tw, { css, styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { POPUP_ID } from '~/types';

import { LiquidityPoolLayout } from './layouts/layout-liquidity-pool';
import { MyLiquidityLayout } from './layouts/layout-liquidity-pool-my';
import { MainLayout } from './layouts/layout-main';

const HomePage = () => {
  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);

  const { evm, fpass, xrp } = useConnectedWallet();
  const connected = evm.address || fpass.address || xrp.address;

  return (
    <>
      <Wrapper>
        <GnbWrapper banner={!!opened}>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <MainLayout />
          <ContentWrapper>
            {connected && <MyLiquidityLayout />}
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
  banner ? tw`h-124 mlg:(h-140)` : tw`h-72 mlg:(h-80)`,
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
