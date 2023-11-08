import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { GraphSemiDonut } from '~/components/graph';

import { formatNumberWithComma } from '~/utils';
import { IPool, ITokenComposition } from '~/types';

import { useGraphTotalComposition } from '../hooks/components/graph/use-graph-total-composition';

interface TokenInfoProps {
  symbol: string;
  balance: number;
  value: number;
}
const TokenInfo = ({ token, index }: { token: TokenInfoProps; index: number }) => {
  const { t } = useTranslation();
  return (
    <TokenInfoWrapper>
      <TokenSymbolWrapper>
        <TokenColorCircle index={index} />
        <TokenSymbolText>
          {t('Total')} {token.symbol}
        </TokenSymbolText>
      </TokenSymbolWrapper>
      <TokenValueWrapper>
        <TokenBalance>
          {formatNumberWithComma(Math.trunc(token.balance))}
          {` `}
          {token.symbol}
        </TokenBalance>
        <TokenValue>${formatNumberWithComma(Math.trunc(token.value))}</TokenValue>
      </TokenValueWrapper>
    </TokenInfoWrapper>
  );
};
interface Props {
  pool: IPool;
}
export const PoolCompositions = ({ pool }: Props) => {
  const { poolData } = useGraphTotalComposition(pool.id);
  const { t } = useTranslation();

  const graphData: ITokenComposition[] =
    poolData?.map(data => ({
      symbol: data?.symbol ?? '',
      weight: data?.weight ?? 0,
      value: data?.value ?? 0,
      balance: data?.balance ?? 0,
    })) ?? [];

  return (
    <Wrapper>
      <Title>{t('Pool composition')}</Title>
      <ContentsWrapper>
        <TokenInfo token={poolData[0]} index={0} />
        <GraphWrapper>
          <GraphSemiDonut data={graphData} />
        </GraphWrapper>
        <TokenInfo token={poolData[1]} index={1} />
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

const GraphWrapper = tw.div`h-190 flex-center overflow-hidden`;

const Title = tw.div`
  font-b-20 text-primary-60
`;
