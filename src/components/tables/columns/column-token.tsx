import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { BadgeNew } from '~/components/badges/new';
import { Token } from '~/components/token';

import { useMediaQuery } from '~/hooks/utils';
import { useTablePoolCompositionSelectTokenStore } from '~/states/components';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: {
    symbol: string;
    image?: string;
    issuer?: string;
  }[];
  isNew?: boolean;
  disableSelectedToken?: boolean;
}

export const TableColumnToken = ({ tokens, isNew, disableSelectedToken, ...rest }: Props) => {
  const { selectedTokens } = useTablePoolCompositionSelectTokenStore();
  const { isMD } = useMediaQuery();

  return (
    <Wrapper {...rest}>
      {tokens.map(token => (
        <Token
          key={token.symbol}
          token={token.symbol}
          image={true}
          imageUrl={token.image}
          issuer={token.issuer}
          selected={!disableSelectedToken && !!selectedTokens?.find(t => t.symbol === token.symbol)}
          type={isMD ? 'large' : 'small'}
        />
      ))}
      {isNew && <BadgeNew />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex gap-6 items-center flex-1
  md:(gap-8)
`;
