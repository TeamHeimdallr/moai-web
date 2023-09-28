import tw, { css, styled } from 'twin.macro';

import { Footer } from '~/components/footer';

import { useConnectEvmWallet } from '~/hooks/data/use-connect-evm-wallet';

import { CHAIN_ID } from '~/moai-evm/constants';

import { SwitchNetwork } from '~/moai-evm/components/banner/switch-network';
import { Gnb } from '~/moai-evm/components/gnb';

import { useSwitchNetwork } from '~/moai-evm/hooks/pages/use-switch-network';

import { LiquidityPoolLayout } from './layouts/layout-liquidity-pool';
import { MainLayout } from './layouts/layout-main';
import { MyLiquidityLayout } from './layouts/layout-my-liquidity';

const HomePage = () => {
  const { isConnected } = useConnectEvmWallet();
  const { needSwitchNetwork } = useSwitchNetwork(CHAIN_ID);

  return (
    <>
      {needSwitchNetwork && <SwitchNetwork />}
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
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
