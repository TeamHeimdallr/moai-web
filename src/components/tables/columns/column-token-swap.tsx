import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { IconArrowNext } from '~/assets/icons';

import { Token } from '~/components/token';

import { IToken } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: IToken[];
}
export const TableColumnTokenSwap = ({ tokens, ...rest }: Props) => {
  const [tokenA, tokenB] = tokens;

  if (!tokenA || !tokenB) return <></>;
  return (
    <Wrapper {...rest}>
      <Token
        key={tokenA.symbol}
        title={`${Number((tokenA?.balance || 0).toFixed(6))}`}
        token={tokenA.symbol}
        image={true}
        type="small"
      />
      <IconWrapper>
        <IconArrowNext width={20} height={20} />
      </IconWrapper>
      <Token
        key={tokenB.symbol}
        title={`${Number((tokenA?.balance || 0).toFixed(6))}`}
        token={tokenB.symbol}
        image={true}
        type="small"
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-1 gap-8 items-center h-32
`;
const IconWrapper = tw.div`flex-center`;
