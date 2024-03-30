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

  const allTokens = [
    [
      {
        id: 0,
        symbol: 'USDT',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0x30E98e06A002f9bbE4b86Bc132228FE8eC2c96cf',
        currency: 'USDT',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000n,
        balance: 3000000000000000,
      },
      {
        id: 0,
        symbol: 'USDT',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xb7494CEC27Dc2A4a94F1808Bc7AF266958739D66',
        currency: 'USDT',

        isLpToken: false,
        isCexListed: false,
        amount: 0n,
        balance: 3000000000000000,
      },
      {
        id: 1,
        symbol: 'USDC',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xcCcCCCCc00000864000000000000000000000000',
        currency: 'USDC',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000n,
        balance: 3000000000000000,
      },
    ],
    // 259614.8429267409214265248164610048
    // 245939.723478460686762290
    // 125681.334528690893115089

    [
      {
        id: 0,
        symbol: 'XRP',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xCCCCcCCc00000002000000000000000000000000',
        currency: 'XRP',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000n,
        balance: 3000000000000000,
      },
      {
        id: 1,
        symbol: 'USDC',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xCCcCCcCC00000C64000000000000000000000000',
        currency: 'USDC',

        isLpToken: false,
        isCexListed: false,
        amount: 611800n,
        balance: 3000000000000000,
      },
    ],

    [
      {
        id: 0,
        symbol: 'XRP',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xCCCCcCCc00000002000000000000000000000000',
        currency: 'XRP',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000n,
        balance: 3000000000000000,
      },
      {
        id: 1,
        symbol: 'ASTO',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xCccCccCc00001064000000000000000000000000',
        currency: 'ASTO',

        isLpToken: false,
        isCexListed: false,
        amount: 1168500000000000000n,
        balance: 9000000000000000000000,
      },
    ],

    [
      {
        id: 0,
        symbol: 'XRP',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xCCCCcCCc00000002000000000000000000000000',
        currency: 'XRP',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000n,
        balance: 3000000000000000,
      },
      {
        id: 1,
        symbol: 'SYLO',
        network: NETWORK.THE_ROOT_NETWORK,

        address: '0xcccccccc00000864000000000000000000000000',
        currency: 'SYLO',

        isLpToken: false,
        isCexListed: false,
        amount: 21003600000000000000n,
        balance: 9000000000000000000000,
      },
    ],
  ];

  const allTokensEvm = [
    [
      {
        id: 0,
        symbol: 'XRP',
        network: NETWORK.EVM_SIDECHAIN,

        address: '0x0000000000000000000000000000000000000000',
        currency: 'XRP',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000000000000000n,
        balance: 9000000000000000000000,
      },
      {
        id: 1,
        symbol: 'USDC',
        network: NETWORK.EVM_SIDECHAIN,

        address: '0xFB3f9101C7cB845958b7649ab1d52F2a30ca4294',
        currency: 'USDC',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000000000000000n,
        balance: 9000000000000000000000,
      },
    ],
    [
      {
        id: 0,
        symbol: 'MOAI',
        network: NETWORK.EVM_SIDECHAIN,

        address: '0x7cEf8d13B5aa9c3AEA3456C7845A441e58cEBC00',
        currency: 'MOAI',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000000000000000n,
        balance: 9000000000000000000000,
      },
      {
        id: 1,
        symbol: 'XRP',
        network: NETWORK.EVM_SIDECHAIN,

        address: '0x0000000000000000000000000000000000000000',
        currency: 'XRP',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000000000000000n,
        balance: 9000000000000000000000,
      },
    ],
    [
      {
        id: 0,
        symbol: 'WBTC',
        network: NETWORK.EVM_SIDECHAIN,

        address: '0x22e7163f6ED77D7ff19608392f06fdB4b12A0686',
        currency: 'WBTC',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000000000000n,
        balance: 9000000000000000000000,
      },
      {
        id: 1,
        symbol: 'XRP',
        network: NETWORK.EVM_SIDECHAIN,

        address: '0x0000000000000000000000000000000000000000',
        currency: 'XRP',

        isLpToken: false,
        isCexListed: false,
        amount: 1000000000000000000n,
        balance: 9000000000000000000000,
      },
    ],
  ];

  const { writeAsync } = useAddLiquidity({
    poolId: '0xb7494cec27dc2a4a94f1808bc7af266958739d66000000000000000000000006',
    tokens: allTokens[0],
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
