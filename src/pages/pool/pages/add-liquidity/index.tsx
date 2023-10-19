import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import { useTokenBalanceInPool } from '~/api/api-contract/balance/get-token-balance-in-pool';
import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { useTokenPrice } from '~/api/api-contract/token/price';

import { IconBack } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useRequirePrarams } from '~/hooks/utils/use-require-params';
import { IToken } from '~/types';

import { AddLiquidityBalances } from '../../components/add-liquidity-balances';
import { AddLiquidityInputGroup } from '../../components/add-liquidity-input-group';

const PoolDetailAddLiquidityPage = () => {
  const navigate = useNavigate();
  const { getTokenPrice } = useTokenPrice();

  const { id } = useParams();

  useRequirePrarams([!!id], () => navigate(-1));

  const { pool } = useLiquidityPoolBalance(id ?? '');
  const { balancesArray } = useTokenBalanceInPool();
  const { compositions } = pool;

  const tokens: IToken[] = compositions?.map(composition => {
    const data = balancesArray?.find(b => b.symbol === composition.symbol);

    if (!data) return { symbol: composition.symbol, balance: 0, price: 0, value: 0 };
    return {
      symbol: composition.symbol,
      balance: data.balance,
      price: getTokenPrice(composition.symbol),
      value: data.value,
    };
  });

  return (
    <>
      {/* {needSwitchNetwork && <SwitchNetwork />} */}
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
              <AddLiquidityBalances tokens={tokens} />
              <AddLiquidityInputGroup pool={pool} />
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
