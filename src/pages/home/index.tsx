import { useEffect, useState } from 'react';
import tw, { css, styled } from 'twin.macro';
import { useNetwork } from 'wagmi';

import { Footer } from '~/components/footer';
import { MANTLE_CHAIN_ID } from '~/constants';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';

import { SwitchNetwork } from './components/switch-network';
import { LiquidityPoolLayout } from './layouts/layout-liquidity-pool';
import { MainLayout } from './layouts/layout-main';
import { MyLiquidityLayout } from './layouts/layout-my-liquidity';

const HomePage = () => {
  const [needSwitchNetwork, setNeedSwitchNetwork] = useState(false);

  const { isConnected } = useConnectWallet();
  const { chain } = useNetwork();

  useEffect(() => {
    if (!chain || chain.id === MANTLE_CHAIN_ID) setNeedSwitchNetwork(false);
    else setNeedSwitchNetwork(true);
  }, [chain]);

  return (
    <>
      {needSwitchNetwork && <SwitchNetwork />}
      <Wrapper>
        <GnbWrapper>GNB</GnbWrapper>
        <InnerWrapper>
          <MainLayout />
          <ContentWrapper>
            {isConnected && <MyLiquidityLayout />}
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

const GnbWrapper = tw.div`
  w-full h-80 absolute top-0 left-0 flex-center bg-neutral-80/20 text-neutral-100 z-10
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-80`,
  css`
    & > div {
      width: 100%;
      max-width: 1440px;
    }
  `,
]);

export default HomePage;
