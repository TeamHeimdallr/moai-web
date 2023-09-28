import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';
import { Address, isAddress } from 'viem';

import { IconBack } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons/icon';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useRequirePrarams } from '~/hooks/pages/use-require-params';

import { useLiquidityPoolBalance } from '~/moai-evm/api/api-contract/pool/get-liquidity-pool-balance';

import { CHAIN_ID, TOKEN_USD_MAPPER } from '~/moai-evm/constants';

import { BalanceInfo } from '~/moai-evm/components/balance-info';
import { SwitchNetwork } from '~/moai-evm/components/banner/switch-network';
import { TokenInfo } from '~/moai-evm/types/components';

import { useSwitchNetwork } from '~/moai-evm/hooks/pages/use-switch-network';

import { useBalancesAll } from '~/moai-evm/hooks/data/use-balance-all';

import { AddLiquidityInput } from '../../layouts/add-liquidity-input-group';

const PoolDetailAddLiquidityPage = () => {
  const navigate = useNavigate();
  const { needSwitchNetwork } = useSwitchNetwork(CHAIN_ID);

  const { id: poolId } = useParams();

  useRequirePrarams([!!poolId, isAddress(poolId as Address)], () => navigate(-1));

  const { poolInfo } = useLiquidityPoolBalance(poolId as Address);
  const { balancesMap } = useBalancesAll();
  const { compositions } = poolInfo;

  const tokens: TokenInfo[] = compositions?.map(composition => {
    const data = balancesMap?.[composition.name];

    if (!data) return { name: composition.name, balance: 0, price: 0, value: 0 };
    return {
      name: composition.name,
      balance: data.balance,
      price: TOKEN_USD_MAPPER[composition.name] ?? 0,
      value: data.value,
    };
  });

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
              <Title>Add liquidity</Title>
            </Header>

            <LiquidityWrapper>
              <BalanceInfo tokens={tokens} />
              <AddLiquidityInput tokens={tokens} poolInfo={poolInfo} />
            </LiquidityWrapper>
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
      max-width: 786px;
    }
  `,
]);

const Title = tw.div`
  font-b-24 h-40 flex items-center text-neutral-100
`;

const LiquidityWrapper = tw.div`
  flex gap-40 items-start
`;

export default PoolDetailAddLiquidityPage;
