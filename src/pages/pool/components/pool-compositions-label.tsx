import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { THOUSAND } from '~/constants';

import { formatNumber } from '~/utils';
import { ITokenComposition } from '~/types';

interface Props {
  composition: ITokenComposition;
  idx: number;
}
export const TokenCompositionLabel = ({ composition, idx }: Props) => {
  const { t } = useTranslation();

  const { symbol, balance, value } = composition || {};

  if (!composition) return;
  return (
    <Wrapper>
      <TokenSymbolWrapper>
        <TokenColorCircle idx={idx} />
        <TokenSymbolText>
          {t('Total')} {symbol}
        </TokenSymbolText>
      </TokenSymbolWrapper>
      <TokenValueWrapper>
        <TokenBalance>
          {formatNumber(balance, 4, 'floor', THOUSAND, 4)} {symbol}
        </TokenBalance>
        {!!value && <TokenValue>${formatNumber(value)}</TokenValue>}
      </TokenValueWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col items-center gap-8 flex-1
  md:(flex-initial min-w-200)
`;
const TokenSymbolWrapper = tw.div`
  flex items-center gap-5
`;
const TokenValueWrapper = tw.div`
  flex flex-col items-center
`;

interface TokenColorCircleProps {
  idx: number;
}
const TokenColorCircle = styled.div<TokenColorCircleProps>(({ idx }) => [
  tw`w-12 h-12 rounded-full`,
  idx === 0 ? tw`bg-primary-60` : tw`bg-[#A3B6FF]`,
]);

const TokenSymbolText = tw.div`
  font-r-12 text-neutral-80
  md:(font-r-14)
`;
const TokenBalance = tw.div`
  font-m-18 text-neutral-100
  md:(font-m-20)
`;
const TokenValue = tw.div`
  font-r-12 text-neutral-60
  md:(font-r-14)
`;
