import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { BadgeNew } from '~/components/badges/new';
import { Token } from '~/components/token';

import { useTablePoolCompositionSelectTokenStore } from '~/states/components';
import { Entries } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: Record<string, number>;
  isNew?: boolean;
}
// will be removed
export const TableColumnToken = ({ tokens, isNew, ...rest }: Props) => {
  const { selectedTokens } = useTablePoolCompositionSelectTokenStore();

  return (
    <Wrapper {...rest}>
      {(Object.entries(tokens) as Entries<Record<string, number>>).map(([token]) => (
        <Token
          key={token}
          token={token}
          image={true}
          selected={selectedTokens?.includes(token)}
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
