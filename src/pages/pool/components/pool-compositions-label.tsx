import tw, { styled } from 'twin.macro';

import { formatNumber } from '~/utils';
import { ITokenComposition } from '~/types';

interface Props {
  composition: ITokenComposition;
  idx: number;
}
export const TokenCompositionLabel = ({ composition, idx }: Props) => {
  const { symbol, balance, value } = composition || {};

  if (!composition) return;
  return (
    <Wrapper>
      <TokenSymbolWrapper>
        <TokenColorCircle idx={idx} />
        <TokenSymbolText>Total {symbol}</TokenSymbolText>
      </TokenSymbolWrapper>
      <TokenValueWrapper>
        <TokenBalance>
          {formatNumber(balance)} {symbol}
        </TokenBalance>
        <TokenValue>${formatNumber(value)}</TokenValue>
      </TokenValueWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`flex flex-col w-202 items-center gap-8`;
const TokenSymbolWrapper = tw.div`flex items-center gap-5 `;
const TokenValueWrapper = tw.div`flex flex-col items-center`;

interface TokenColorCircleProps {
  idx: number;
}
const TokenColorCircle = styled.div<TokenColorCircleProps>(({ idx }) => [
  tw`w-12 h-12 rounded-full`,
  idx === 0 ? tw`bg-primary-60` : tw`bg-[#A3B6FF]`,
]);

const TokenSymbolText = tw.div`font-r-14 text-neutral-80`;
const TokenBalance = tw.div`font-m-20 text-neutral-100`;
const TokenValue = tw.div`font-r-14 text-neutral-60`;
