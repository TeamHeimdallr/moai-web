import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { BadgeNew } from '~/components/badges/new';
import { Token } from '~/components/token';

import { useTablePoolCompositionSelectTokenStore } from '~/states/components';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: {
    symbol: string;
    image?: string;
  }[];
  isNew?: boolean;
}

export const TableColumnToken = ({ tokens, isNew, ...rest }: Props) => {
  const { selectedTokens } = useTablePoolCompositionSelectTokenStore();

  return (
    <Wrapper {...rest}>
      {tokens.map(token => (
        <Token
          key={token.symbol}
          token={token.symbol}
          image={true}
          imageUrl={token.image}
          selected={selectedTokens?.includes(token.symbol)}
          type="large"
        />
      ))}
      {isNew && <BadgeNew />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex gap-8 items-center flex-1
`;
