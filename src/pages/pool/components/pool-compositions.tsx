import tw, { styled } from 'twin.macro';

import { GraphSemiDonut } from '~/components/graph';

import { formatNumberWithComma } from '~/utils';
import { IPool, ITokenComposition } from '~/types';

import { useGraphTotalComposition } from '../hooks/components/graph/use-graph-total-composition';

interface TokenInfoProps {
  symbol: string;
  balance: string;
  value: string;
  index: number;
}
const TokenInfo = ({ token }: { token: TokenInfoProps }) => {
  return (
    <TokenInfoWrapper>
      <TokenSymbolWrapper>
        <TokenColorCircle index={token.index} />
        <TokenSymbolText>Total {token.symbol}</TokenSymbolText>
      </TokenSymbolWrapper>
      <TokenValueWrapper>
        <TokenBalance>
          {token.balance} {token.symbol}
        </TokenBalance>
        <TokenValue>{token.value}</TokenValue>
      </TokenValueWrapper>
    </TokenInfoWrapper>
  );
};
interface Props {
  pool: IPool;
}
export const PoolCompositions = ({ pool }: Props) => {
  const { poolData } = useGraphTotalComposition(pool.id);

  const data: ITokenComposition[] = [
    {
      symbol: poolData[0].symbol,
      weight: poolData[0].weight,
      value: poolData[0].value,
      balance: poolData[0].balance,
    },
    {
      symbol: poolData[1].symbol,
      weight: poolData[1].weight,
      value: poolData[1].value,
      balance: poolData[1].balance,
    },
  ];
  return (
    <Wrapper>
      <Title>Pool composition</Title>
      <ContentsWrapper>
        <TokenInfo
          token={{
            symbol: poolData[0].symbol,
            balance: formatNumberWithComma(Math.trunc(poolData[0].balance)),
            value: `$${formatNumberWithComma(Math.trunc(poolData[0].value))}`,
            index: 0,
          }}
        />
        <GraphWrapper>
          <GraphSemiDonut data={data} />
        </GraphWrapper>
        <TokenInfo
          token={{
            symbol: poolData[1].symbol,
            balance: formatNumberWithComma(Math.trunc(poolData[1].balance)),
            value: `$${formatNumberWithComma(Math.trunc(poolData[1].value))}`,
            index: 1,
          }}
        />
      </ContentsWrapper>
    </Wrapper>
  );
};

const TokenInfoWrapper = tw.div`flex flex-col w-202 items-center gap-8`;
const TokenSymbolWrapper = tw.div`flex items-center gap-5 `;
const TokenValueWrapper = tw.div`flex flex-col items-center`;
interface TokenColorCircleProps {
  index: number;
}
const TokenColorCircle = styled.div<TokenColorCircleProps>(({ index }) => [
  tw`w-12 h-12 rounded-full`,
  index === 0 ? tw`bg-primary-60` : tw`bg-[#A3B6FF]`,
]);
const TokenSymbolText = tw.div`font-r-14 text-neutral-80`;
const TokenBalance = tw.div`font-m-20 text-neutral-100`;
const TokenValue = tw.div`font-r-14 text-neutral-60`;

const Wrapper = tw.div`
  flex flex-col gap-24 bg-neutral-10 rounded-12 px-24 pt-20 pb-40
`;

const ContentsWrapper = tw.div`
  flex items-center justify-between
`;

const GraphWrapper = tw.div`-my-90`;

const Title = tw.div`
  font-b-20 text-primary-60
`;
