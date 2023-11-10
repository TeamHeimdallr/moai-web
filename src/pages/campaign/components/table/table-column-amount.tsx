import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { formatNumber } from '~/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  balance: number;
  value: number;
  width?: number | 'full';
}
// TODO: will be removed
export const TableColumnAmount = ({ balance, value, width, ...rest }: Props) => {
  return (
    <Wrapper width={width} {...rest}>
      <Balance>
        {balance}
        {' XRP'}
      </Balance>
      <Value>${formatNumber(value, 2)}</Value>
    </Wrapper>
  );
};

interface WrapperProps {
  width?: number | 'full';
}
const Wrapper = styled.div<WrapperProps>(({ width }) => [
  tw`flex flex-col flex-shrink-0 w-849`,
  width === 'full' && tw`flex-1 w-full`,
  typeof width === 'number' &&
    css`
      width: ${width}px;
    `,
]);

const Balance = tw.div`font-m-18 text-neutral-100`;
const Value = tw.div`font-r-14 text-neutral-70`;
