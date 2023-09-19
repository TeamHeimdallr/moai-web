import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';
import { Address, isAddress } from 'viem';

import { usePoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { IconBack } from '~/assets/icons';
import { SwitchNetwork } from '~/components/banner/switch-network';
import { ButtonIconLarge } from '~/components/buttons/icon';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { CHAIN_ID } from '~/constants';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';
import { useSwitchNetwork } from '~/hooks/pages/use-switch-network';

import { WithdrawLiquidityInput } from '../../layouts/withdraw-liquidity-input';

const PoolDetailWithdrawLiquidityPage = () => {
  const { address } = useConnectWallet();
  const { needSwitchNetwork } = useSwitchNetwork(CHAIN_ID);
  const navigate = useNavigate();

  const { id } = useParams();

  useRequirePrarams([!!id, isAddress(id as Address)], () => navigate(-1));
  const { poolInfo, compositions, tokenTotalSupply, liquidityPoolTokenBalance } = usePoolBalance(
    id as Address,
    address
  );

  /*
  {
    "id": "0x7e6acf4545f676d250f856a8b10f67f6244c1912000200000000000000000001",
    "tokenAddress": "0x7E6AcF4545F676d250F856A8b10f67f6244C1912",
    "compositions": [
        {
            "tokenAddress": "0xaf5F3781678a0Bd4258cB4e9885b26E6629b7930",
            "name": "MOAI",
            "weight": 80,
            "balance": 118.38974325041556,
            "price": 142.23
        },
        {
            "tokenAddress": "0xd1A5c7Dd009e578bf4aC8f9392D1fFdbC27B86BB",
            "name": "WETH",
            "weight": 20,
            "balance": 1.8554173969419219,
            "price": 1718.39
        }
    ],
    "value": "$20,026.9",
    "volume": "$479.85",
    "apr": "2.62%",
    "fees": "$1.44",
    "name": "80MOAI-20WETH"
}
[
    {
        "tokenAddress": "0xaf5F3781678a0Bd4258cB4e9885b26E6629b7930",
        "name": "MOAI",
        "weight": 80,
        "balance": 118.38974325041556,
        "price": 142.23
    },
    {
        "tokenAddress": "0xd1A5c7Dd009e578bf4aC8f9392D1fFdbC27B86BB",
        "name": "WETH",
        "weight": 20,
        "balance": 1.8554173969419219,
        "price": 1718.39
    }
]
103.10108966631066 0
  */

  return (
    <>
      {needSwitchNetwork && <SwitchNetwork />}
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          <ContentWrapper>
            <Header>
              <ButtonIconLarge icon={<IconBack />} onClick={() => navigate(-1)} />
              <Title>Withdraw from pool</Title>
            </Header>

            <WithdrawWrapper>
              <WithdrawLiquidityInput
                poolInfo={poolInfo}
                compositions={compositions}
                tokenTotalSupply={tokenTotalSupply}
                liquidityPoolTokenBalance={liquidityPoolTokenBalance}
              />
            </WithdrawWrapper>
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

const GnbWrapper = tw.div`
  w-full h-80 flex-center
`;

const Header = tw.div`flex items-center gap-12 font-b-24 text-neutral-100`;

const InnerWrapper = tw.div`
  flex flex-col gap-40 pt-40 pb-120
`;

const ContentWrapper = styled.div(() => [
  tw`flex flex-col items-center gap-40`,
  css`
    & > div {
      width: 100%;
      max-width: 455px;
    }
  `,
]);

const Title = tw.div`
  font-b-24 h-40 flex items-center text-neutral-100
`;

const WithdrawWrapper = tw.div`
  flex justify-center
`;

export default PoolDetailWithdrawLiquidityPage;
