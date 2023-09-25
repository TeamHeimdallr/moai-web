import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { Token } from '~/components/token';

import { TokenInfo } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: TokenInfo[];
  isNew?: boolean;
}
export const TableColumnTokenPair = ({ tokens, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      {tokens.map(token => (
        <Token
          key={token.name}
          title={`${Number(token.balance.toFixed(6))}`}
          token={token.name}
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
