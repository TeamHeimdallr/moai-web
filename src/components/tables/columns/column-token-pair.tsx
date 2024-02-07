import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { THOUSAND } from '~/constants';

import { Token } from '~/components/token';

import { formatNumber } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: {
    symbol: string;
    value?: number;
    image?: string;
  }[];
}

export const TableColumnTokenPair = ({ tokens, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      {tokens.map(token => (
        <Token
          key={token.symbol}
          title={`${formatNumber(token.value, 2, 'floor', THOUSAND, 0)}`}
          token={token.symbol}
          image={true}
          imageUrl={token.image}
          type="small"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-1 gap-8 items-center h-32
`;
