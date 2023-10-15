import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { Token } from '~/components/token';

import { IToken } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: IToken[];
  isNew?: boolean;
}
export const TableColumnTokenPair = ({ tokens, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      {tokens.map(token => (
        <Token
          key={token.symbol}
          title={`${Number((token?.balance || 0).toFixed(6))}`}
          token={token.symbol}
          image={true}
          type="small"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-1 gap-8 items-center h-32
`;
