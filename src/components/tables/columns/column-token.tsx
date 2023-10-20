import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { BadgeNew } from '~/components/badges/new';
import { Token } from '~/components/token';

import { Entries } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: Record<string, number>;
  isNew?: boolean;
}
// will be removed
export const TableColumnToken = ({ tokens, isNew, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      {(Object.entries(tokens) as Entries<Record<string, number>>).map(([token, percentage]) => (
        <Token key={token} token={token} percentage={percentage} image={true} type="small" />
      ))}
      {isNew && <BadgeNew />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex gap-8 items-center flex-1 h-32
`;
