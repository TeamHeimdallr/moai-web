import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { THOUSAND } from '~/constants';

import { formatNumber } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  balance: number;
  value: number;

  empty?: boolean;
  align?: 'flex-start' | 'center' | 'flex-end';
}

export const TableColumnAmount = ({ balance, value, empty, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      <Balance>{empty ? '-' : formatNumber(balance, 4, 'floor', THOUSAND, 0)}</Balance>
      {!empty && <Value>{`$${formatNumber(value)}`}</Value>}
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`
    flex flex-col items-end justify-center
    md:(gap-4)
  `,
  align &&
    css`
      align-items: ${align};
    `,
]);
const Balance = tw.div`
  font-r-14 text-neutral-100
  md:(font-r-16)
`;
const Value = tw.div`
  font-r-12 leading-18 text-neutral-80
  md:(font-r-14)
`;
