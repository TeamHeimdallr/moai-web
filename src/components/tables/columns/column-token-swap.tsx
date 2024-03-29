import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { IconArrowNext } from '~/assets/icons';

import { THOUSAND } from '~/constants';

import { Token } from '~/components/token';

import { formatNumber } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: {
    symbol: string;
    value: number;
    image?: string;
  }[];
}
export const TableColumnTokenSwap = ({ tokens, ...rest }: Props) => {
  const [tokenA, tokenB] = tokens;

  if (!tokenA || !tokenB) return <></>;
  return (
    <Wrapper {...rest}>
      <Token
        key={tokenA.symbol}
        title={`${formatNumber(tokenA.value, 2, 'floor', THOUSAND, 0)}`}
        token={tokenA.symbol}
        image
        imageUrl={tokenA.image}
        type="small"
      />
      <IconWrapper>
        <IconArrowNext width={20} height={20} />
      </IconWrapper>
      <Token
        key={tokenB.symbol}
        title={`${formatNumber(tokenB.value, 2, 'floor', THOUSAND, 0)}`}
        token={tokenB.symbol}
        image
        imageUrl={tokenB.image}
        type="small"
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-1 gap-8 items-center h-32
`;
const IconWrapper = tw.div`flex-center`;
