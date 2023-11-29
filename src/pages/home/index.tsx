import tw, { css, styled } from 'twin.macro';

import { useAddLiquidity } from '~/api/api-contract/_evm/pool/add-liquidity';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { NETWORK, POPUP_ID } from '~/types';

import { LiquidityPoolLayout } from './layouts/layout-liquidity-pool';
import { MyLiquidityLayout } from './layouts/layout-liquidity-pool-my';
import { MainLayout } from './layouts/layout-main';

const HomePage = () => {
  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);

  const { evm, fpass, xrp } = useConnectedWallet();
  const connected = evm.address || fpass.address || xrp.address;

  // 0xcCcCCCCc00000864000000000000000000000000 // sylo
  // 0xCccCccCc00001064000000000000000000000000 // asto

  const { writeAsync } = useAddLiquidity({
    poolId: '0xcd1c4de9f374c737944ce2eef413519f9db14434000200000000000000000000',
    tokens: [
      {
        id: 0,
        symbol: 'ROOT',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xcCcCCccC00000001000000000000000000000000',
        currency: 'ROOT',

        isLpToken: false,
        isCexListed: false,
        amount: 16588000n,
        balance: 3000000000000000,
      },
      {
        id: 1,
        symbol: 'XRP',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xCCCCcCCc00000002000000000000000000000000',
        currency: 'XRP',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000n,
        balance: 90000000000000000000,
      },
    ],
    enabled: true,
  });

  const handleClick = async () => {
    console.log('here');
    await writeAsync?.();
  };

  return (
    <>
      <Wrapper>
        <GnbWrapper banner={!!opened}>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <MainLayout />
          <ButtonPrimaryLarge text="HHHHHHHH" onClick={() => handleClick()}></ButtonPrimaryLarge>
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
    h-72
    mlg:(h-80)
  `,
  banner &&
    tw`
      h-124
      mlg:(h-140)
    `,
]);

const ContentWrapper = styled.div(() => [
  tw`
    flex flex-col items-center gap-80
  `,
  css`
    & > div {
      width: 100%;
      max-width: 1440px;
    }
  `,
]);

export default HomePage;
