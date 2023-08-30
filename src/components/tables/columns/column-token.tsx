import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

import { BadgeNew } from '~/components/badges/new';
import { Token } from '~/components/token';
import { TOKEN } from '~/constants';
import { Entries } from '~/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: Record<TOKEN, number>;
  isNew?: boolean;
}
export const TableColumnToken = ({ tokens, isNew, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      {(Object.entries(tokens) as Entries<Record<TOKEN, number>>).map(([token, percentage]) => (
        <Token
          key={token}
          token={token as TOKEN}
          percentage={percentage}
          image={false}
          type="small"
        />
      ))}
      {isNew && <BadgeNew />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex gap-8 items-center flex-1 h-32
`;
