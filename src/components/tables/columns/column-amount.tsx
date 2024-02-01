import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { formatNumber } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  balance: number;
  value: number;

  align?: 'flex-start' | 'center' | 'flex-end';
}

export const TableColumnAmount = ({ balance, value, ...rest }: Props) => {
  return (
    <Wrapper {...rest}>
      <Balance>{formatNumber(balance, 4, 'round', 10000)}</Balance>
      <Value>${formatNumber(value, 4, 'round', 10000)}</Value>
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`
    flex flex-col items-end
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
