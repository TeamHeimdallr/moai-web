import { useNavigate, useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';
import { Address, isAddress } from 'viem';

import { usePoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { COLOR } from '~/assets/colors';
import { IconBack } from '~/assets/icons';
import { BalanceInfo } from '~/components/balance-info';
import { SwitchNetwork } from '~/components/banner/switch-network';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { CHAIN_ID } from '~/constants';
import { useBalancesAll } from '~/hooks/data/use-balance-all';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';
import { useSwitchNetwork } from '~/hooks/pages/use-switch-network';
import { TokenInfo } from '~/types/components';

import { AddLiquidityInput } from '../../layouts/add-liquidity-input-group';

const PoolDetailAddLiquidityPage = () => {
  const { needSwitchNetwork } = useSwitchNetwork(CHAIN_ID);
  const navigate = useNavigate();

  const { id } = useParams();

  useRequirePrarams([!!id, isAddress(id as Address)], () => navigate(-1));

  const { compositions } = usePoolBalance(id as Address);
  const { balancesMap } = useBalancesAll();

  const tokens: TokenInfo[] = compositions?.map(token => {
    const data = balancesMap?.[token.name];

    if (!data) return { name: token.name, balance: 0, value: 0 };
    return {
      name: token.name,
      balance: data.value,
      value: data.valueUSD,
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
              <IconWrapper onClick={() => navigate(-1)}>
                <IconBack fill={COLOR.NEUTRAL[60]} />
              </IconWrapper>
              <Title>Add liquidity</Title>
            </Header>

            <LiquidityWrapper>
              <BalanceInfo tokens={tokens} />
              <AddLiquidityInput tokenList={tokens} />
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

const Header = tw.div`flex items-center gap-12 py-40 font-b-24 text-neutral-100`;

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
const IconWrapper = tw.div`flex-center clickable`;

export default PoolDetailAddLiquidityPage;