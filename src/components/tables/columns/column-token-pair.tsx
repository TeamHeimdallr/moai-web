import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { BadgeNew } from '~/components/badges/new';
import { Token } from '~/components/token';
import { TokenInfo } from '~/types/components';
import { TOKEN } from '~/types/contracts';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: TokenInfo[];
  isNew?: boolean;
}
export const TableColumnTokenPair = ({ tokens, isNew, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      {tokens.map(token => (
        <Token
          key={token.name}
          title={token.balance.toString()}
          token={token.name as TOKEN}
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
